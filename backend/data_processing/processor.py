#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Data Processor for HealthPulse Analytics

This module consumes data from Kafka topics, processes it,
and stores it in PostgreSQL and InfluxDB databases.
"""

import os
import sys
import json
import time
import logging
import datetime
from typing import Dict, List, Any, Optional, Union

import pandas as pd
import numpy as np
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv
from pythonjsonlogger import jsonlogger

# Configure logging
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.datetime.now().isoformat()
        log_record['level'] = record.levelname
        log_record['module'] = record.module
        log_record['line'] = record.lineno

log_handler = logging.StreamHandler()
formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(module)s %(message)s')
log_handler.setFormatter(formatter)

logger = logging.getLogger("healthpulse")
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO').upper())
logger.addHandler(log_handler)

# Load environment variables
load_dotenv()

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092')
PATIENT_DATA_TOPIC = os.getenv('PATIENT_DATA_TOPIC', 'patient-data')
VITALS_TOPIC = os.getenv('VITALS_TOPIC', 'patient-vitals')
LABS_TOPIC = os.getenv('LABS_TOPIC', 'patient-labs')
MEDICATIONS_TOPIC = os.getenv('MEDICATIONS_TOPIC', 'patient-medications')

# PostgreSQL configuration
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'postgres')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'healthpulse')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'healthpulsepassword')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'healthpulse')
POSTGRES_URI = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# InfluxDB configuration
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://influxdb:8086')
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'health-pulse-token')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'healthpulse')
INFLUXDB_BUCKET = os.getenv('INFLUXDB_BUCKET', 'patient_vitals')

# Alert thresholds
ALERT_THRESHOLDS = {
    'deterioration': {'high': 0.7, 'medium': 0.4},
    'readmission': {'high': 0.8, 'medium': 0.5},
    'sepsis': {'high': 0.6, 'medium': 0.3}
}

class DataProcessor:
    """
    Processes data from Kafka streams and stores it in databases.
    """
    
    def __init__(self):
        """Initialize the data processor with database connections."""
        
        # Initialize PostgreSQL connection
        try:
            self.db_engine = create_engine(POSTGRES_URI)
            # Test connection
            with self.db_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to PostgreSQL database")
        except SQLAlchemyError as e:
            logger.error(f"Failed to connect to PostgreSQL: {str(e)}")
            sys.exit(1)
        
        # Initialize InfluxDB connection
        try:
            self.influx_client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
            self.influx_write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
            # Test connection
            health = self.influx_client.health()
            if health.status != "pass":
                raise Exception(f"InfluxDB health check failed: {health.message}")
            logger.info("Connected to InfluxDB database")
        except Exception as e:
            logger.error(f"Failed to connect to InfluxDB: {str(e)}")
            sys.exit(1)
        
        # Initialize Kafka consumers
        self.consumers = {}
        
    def initialize_kafka_consumers(self):
        """Initialize Kafka consumers for all topics."""
        topics = [PATIENT_DATA_TOPIC, VITALS_TOPIC, LABS_TOPIC, MEDICATIONS_TOPIC]
        
        for topic in topics:
            try:
                consumer = KafkaConsumer(
                    topic,
                    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                    auto_offset_reset='latest',
                    enable_auto_commit=True,
                    group_id=f'healthpulse-processor',
                    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                    key_deserializer=lambda x: x.decode('utf-8') if x else None
                )
                self.consumers[topic] = consumer
                logger.info(f"Created consumer for topic: {topic}")
            except KafkaError as e:
                logger.error(f"Failed to create consumer for topic {topic}: {str(e)}")
                sys.exit(1)
    
    def process_patient_data(self, message):
        """
        Process patient demographic and basic information.
        
        Args:
            message: Kafka message containing patient data
        """
        try:
            patient_data = message.value
            patient_id = patient_data.get('patient_id')
            
            if not patient_id:
                logger.warning("Received patient data without patient_id")
                return
            
            logger.debug(f"Processing patient data for {patient_id}")
            
            # Extract patient attributes
            patient_record = {
                'patient_id': patient_id,
                'mrn': patient_data.get('mrn'),
                'name': patient_data.get('name'),
                'gender': patient_data.get('gender'),
                'age': patient_data.get('age'),
                'department': patient_data.get('department'),
                'room': patient_data.get('room'),
                'admission_date': patient_data.get('admission_date'),
                'attending_physician': patient_data.get('attending_physician')
            }
            
            # Insert or update patient record
            self.upsert_patient(patient_record)
            
            # Process diagnoses
            if 'diagnoses' in patient_data:
                self.process_diagnoses(patient_id, patient_data['diagnoses'])
            
            # Process comorbidities
            if 'comorbidities' in patient_data:
                self.process_comorbidities(patient_id, patient_data['comorbidities'])
            
            # Process risk scores
            if 'risk_scores' in patient_data:
                self.process_risk_scores(patient_id, patient_data['risk_scores'])
            
            # Process medications
            if 'medications' in patient_data:
                self.process_all_medications(patient_id, patient_data['medications'])
            
            logger.info(f"Processed patient data for {patient_id}")
            
        except Exception as e:
            logger.error(f"Error processing patient data: {str(e)}", exc_info=True)
    
    def upsert_patient(self, patient_record):
        """
        Insert or update a patient record in the database.
        
        Args:
            patient_record: Dictionary containing patient attributes
        """
        try:
            # Check if patient exists
            with self.db_engine.connect() as conn:
                query = text("""
                    SELECT patient_id FROM patients WHERE patient_id = :patient_id
                """)
                result = conn.execute(query, {"patient_id": patient_record['patient_id']})
                patient_exists = result.fetchone() is not None
            
            if patient_exists:
                # Update existing patient
                with self.db_engine.connect() as conn:
                    query = text("""
                        UPDATE patients
                        SET mrn = :mrn,
                            name = :name,
                            gender = :gender,
                            age = :age,
                            department = :department,
                            room = :room,
                            admission_date = :admission_date,
                            attending_physician = :attending_physician,
                            updated_at = NOW()
                        WHERE patient_id = :patient_id
                    """)
                    conn.execute(query, patient_record)
                    conn.commit()
                logger.debug(f"Updated patient record for {patient_record['patient_id']}")
            else:
                # Insert new patient
                with self.db_engine.connect() as conn:
                    query = text("""
                        INSERT INTO patients (
                            patient_id, mrn, name, gender, age, department,
                            room, admission_date, attending_physician
                        ) VALUES (
                            :patient_id, :mrn, :name, :gender, :age, :department,
                            :room, :admission_date, :attending_physician
                        )
                    """)
                    conn.execute(query, patient_record)
                    conn.commit()
                logger.info(f"Inserted new patient record for {patient_record['patient_id']}")
                
        except SQLAlchemyError as e:
            logger.error(f"Database error in upsert_patient: {str(e)}")
            # Continue processing other messages
    
    def process_diagnoses(self, patient_id, diagnoses):
        """
        Process patient diagnoses.
        
        Args:
            patient_id: Patient identifier
            diagnoses: List of diagnoses
        """
        try:
            if not diagnoses:
                return
            
            # Clear existing diagnoses and insert new ones
            with self.db_engine.connect() as conn:
                # First delete existing diagnoses
                query = text("DELETE FROM diagnoses WHERE patient_id = :patient_id")
                conn.execute(query, {"patient_id": patient_id})
                
                # Insert new diagnoses
                for diagnosis in diagnoses:
                    query = text("""
                        INSERT INTO diagnoses (patient_id, diagnosis, diagnosis_date)
                        VALUES (:patient_id, :diagnosis, NOW())
                        ON CONFLICT (patient_id, diagnosis) DO NOTHING
                    """)
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "diagnosis": diagnosis
                    })
                
                conn.commit()
                
            logger.debug(f"Processed {len(diagnoses)} diagnoses for patient {patient_id}")
            
        except SQLAlchemyError as e:
            logger.error(f"Database error in process_diagnoses: {str(e)}")
    
    def process_comorbidities(self, patient_id, comorbidities):
        """
        Process patient comorbidities.
        
        Args:
            patient_id: Patient identifier
            comorbidities: List of comorbidities
        """
        try:
            if not comorbidities:
                return
            
            # Clear existing comorbidities and insert new ones
            with self.db_engine.connect() as conn:
                # First delete existing comorbidities
                query = text("DELETE FROM comorbidities WHERE patient_id = :patient_id")
                conn.execute(query, {"patient_id": patient_id})
                
                # Insert new comorbidities
                for condition in comorbidities:
                    query = text("""
                        INSERT INTO comorbidities (patient_id, condition)
                        VALUES (:patient_id, :condition)
                        ON CONFLICT (patient_id, condition) DO NOTHING
                    """)
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "condition": condition
                    })
                
                conn.commit()
                
            logger.debug(f"Processed {len(comorbidities)} comorbidities for patient {patient_id}")
            
        except SQLAlchemyError as e:
            logger.error(f"Database error in process_comorbidities: {str(e)}")
    
    def process_risk_scores(self, patient_id, risk_scores, timestamp=None):
        """
        Process and store risk scores.
        
        Args:
            patient_id: Patient identifier
            risk_scores: Dictionary of risk scores
            timestamp: Optional timestamp, defaults to now
        """
        try:
            if not risk_scores:
                return
            
            # Use provided timestamp or current time
            if timestamp is None:
                timestamp = datetime.datetime.now().isoformat()
            
            # Extract risk scores
            deterioration_risk = float(risk_scores.get('deterioration', 0))
            readmission_risk = float(risk_scores.get('readmission', 0))
            sepsis_risk = float(risk_scores.get('sepsis', 0))
            
            # Insert into database
            with self.db_engine.connect() as conn:
                query = text("""
                    INSERT INTO risk_scores (
                        patient_id, timestamp, 
                        deterioration_risk, readmission_risk, sepsis_risk
                    )
                    VALUES (
                        :patient_id, :timestamp, 
                        :deterioration_risk, :readmission_risk, :sepsis_risk
                    )
                """)
                
                conn.execute(query, {
                    "patient_id": patient_id,
                    "timestamp": timestamp,
                    "deterioration_risk": deterioration_risk,
                    "readmission_risk": readmission_risk,
                    "sepsis_risk": sepsis_risk
                })
                
                conn.commit()
            
            # Also store in InfluxDB for time-series analysis
            point = Point("risk_scores") \
                .tag("patient_id", patient_id) \
                .field("deterioration", deterioration_risk) \
                .field("readmission", readmission_risk) \
                .field("sepsis", sepsis_risk) \
                .time(timestamp, WritePrecision.MS)
            
            self.influx_write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            
            # Check if we need to generate alerts
            self.check_risk_alerts(patient_id, risk_scores, timestamp)
            
            logger.debug(f"Processed risk scores for patient {patient_id}")
            
        except Exception as e:
            logger.error(f"Error in process_risk_scores: {str(e)}")
    
    def process_vitals(self, message):
        """
        Process patient vital signs.
        
        Args:
            message: Kafka message containing vitals data
        """
        try:
            vitals_data = message.value
            patient_id = vitals_data.get('patient_id')
            timestamp = vitals_data.get('timestamp')
            
            if not patient_id or not timestamp:
                logger.warning("Received vitals data without patient_id or timestamp")
                return
            
            # Store in PostgreSQL for relational queries
            with self.db_engine.connect() as conn:
                query = text("""
                    INSERT INTO vitals (
                        patient_id, timestamp, heart_rate, systolic_bp, diastolic_bp,
                        temperature, respiration_rate, o2_saturation, pain_level
                    )
                    VALUES (
                        :patient_id, :timestamp, :heart_rate, :systolic_bp, :diastolic_bp,
                        :temperature, :respiration_rate, :o2_saturation, :pain_level
                    )
                """)
                
                conn.execute(query, {
                    "patient_id": patient_id,
                    "timestamp": timestamp,
                    "heart_rate": vitals_data.get('heart_rate'),
                    "systolic_bp": vitals_data.get('systolic_bp'),
                    "diastolic_bp": vitals_data.get('diastolic_bp'),
                    "temperature": vitals_data.get('temperature'),
                    "respiration_rate": vitals_data.get('respiration_rate'),
                    "o2_saturation": vitals_data.get('o2_saturation'),
                    "pain_level": vitals_data.get('pain_level')
                })
                
                conn.commit()
            
            # Store in InfluxDB for time-series visualization
            point = Point("vitals") \
                .tag("patient_id", patient_id) \
                .field("heart_rate", vitals_data.get('heart_rate')) \
                .field("systolic_bp", vitals_data.get('systolic_bp')) \
                .field("diastolic_bp", vitals_data.get('diastolic_bp')) \
                .field("temperature", vitals_data.get('temperature')) \
                .field("respiration_rate", vitals_data.get('respiration_rate')) \
                .field("o2_saturation", vitals_data.get('o2_saturation')) \
                .field("pain_level", vitals_data.get('pain_level', 0)) \
                .time(timestamp, WritePrecision.MS)
                
            self.influx_write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            
            logger.debug(f"Processed vitals for patient {patient_id}")
            
        except Exception as e:
            logger.error(f"Error in process_vitals: {str(e)}")
    
    def process_labs(self, message):
        """
        Process patient laboratory results.
        
        Args:
            message: Kafka message containing lab data
        """
        try:
            lab_data = message.value
            patient_id = lab_data.get('patient_id')
            timestamp = lab_data.get('timestamp')
            
            if not patient_id or not timestamp:
                logger.warning("Received lab data without patient_id or timestamp")
                return
            
            # Determine if value is abnormal
            is_abnormal = False
            normal_min = lab_data.get('normal_min')
            normal_max = lab_data.get('normal_max')
            value = lab_data.get('value')
            
            if normal_min is not None and normal_max is not None and value is not None:
                is_abnormal = value < normal_min or value > normal_max
            
            # Store in PostgreSQL
            with self.db_engine.connect() as conn:
                query = text("""
                    INSERT INTO lab_results (
                        patient_id, timestamp, test_name, value,
                        unit, normal_min, normal_max, is_abnormal
                    )
                    VALUES (
                        :patient_id, :timestamp, :test_name, :value,
                        :unit, :normal_min, :normal_max, :is_abnormal
                    )
                """)
                
                conn.execute(query, {
                    "patient_id": patient_id,
                    "timestamp": timestamp,
                    "test_name": lab_data.get('test_name'),
                    "value": value,
                    "unit": lab_data.get('unit'),
                    "normal_min": normal_min,
                    "normal_max": normal_max,
                    "is_abnormal": is_abnormal
                })
                
                conn.commit()
            
            # Store in InfluxDB for time-series visualization
            point = Point("labs") \
                .tag("patient_id", patient_id) \
                .tag("test_name", lab_data.get('test_name')) \
                .field("value", value) \
                .field("is_abnormal", int(is_abnormal)) \
                .time(timestamp, WritePrecision.MS)
                
            self.influx_write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            
            # If abnormal, consider generating an alert
            if is_abnormal:
                self.check_lab_alert(patient_id, lab_data)
            
            logger.debug(f"Processed lab result for patient {patient_id}: {lab_data.get('test_name')}")
            
        except Exception as e:
            logger.error(f"Error in process_labs: {str(e)}")
    
    def process_medication(self, message):
        """
        Process medication updates.
        
        Args:
            message: Kafka message containing medication data
        """
        try:
            med_data = message.value
            patient_id = med_data.get('patient_id')
            timestamp = med_data.get('timestamp')
            action = med_data.get('action')
            medication = med_data.get('medication')
            
            if not patient_id or not timestamp or not action or not medication:
                logger.warning("Received incomplete medication data")
                return
            
            with self.db_engine.connect() as conn:
                if action == 'add':
                    # Add new medication
                    query = text("""
                        INSERT INTO medications (
                            patient_id, name, dosage, frequency, route, start_date
                        )
                        VALUES (
                            :patient_id, :name, :dosage, :frequency, :route, :start_date
                        )
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "name": medication.get('name'),
                        "dosage": medication.get('dosage'),
                        "frequency": medication.get('frequency'),
                        "route": medication.get('route'),
                        "start_date": medication.get('start_date') or timestamp
                    })
                    
                elif action == 'discontinue':
                    # Discontinue an existing medication
                    query = text("""
                        UPDATE medications
                        SET end_date = :end_date, updated_at = NOW()
                        WHERE patient_id = :patient_id
                        AND name = :name
                        AND start_date = :start_date
                        AND end_date IS NULL
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "name": medication.get('name'),
                        "start_date": medication.get('start_date'),
                        "end_date": timestamp
                    })
                    
                elif action == 'change_dose':
                    # Change dosage of an existing medication
                    # First end the current dose
                    query = text("""
                        UPDATE medications
                        SET end_date = :end_date, updated_at = NOW()
                        WHERE patient_id = :patient_id
                        AND name = :name
                        AND dosage = :old_dosage
                        AND end_date IS NULL
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "name": medication.get('name'),
                        "old_dosage": med_data.get('old_dosage'),
                        "end_date": timestamp
                    })
                    
                    # Then add new dose
                    query = text("""
                        INSERT INTO medications (
                            patient_id, name, dosage, frequency, route, start_date
                        )
                        VALUES (
                            :patient_id, :name, :dosage, :frequency, :route, :start_date
                        )
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "name": medication.get('name'),
                        "dosage": medication.get('dosage'),
                        "frequency": medication.get('frequency'),
                        "route": medication.get('route'),
                        "start_date": timestamp
                    })
                
                conn.commit()
            
            # Store medication event in InfluxDB for timeline visualization
            point = Point("medication_events") \
                .tag("patient_id", patient_id) \
                .tag("action", action) \
                .tag("name", medication.get('name')) \
                .field("dosage", medication.get('dosage', '')) \
                .field("route", medication.get('route', '')) \
                .time(timestamp, WritePrecision.MS)
                
            self.influx_write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            
            logger.debug(f"Processed medication {action} for patient {patient_id}: {medication.get('name')}")
            
        except Exception as e:
            logger.error(f"Error in process_medication: {str(e)}")
    
    def process_all_medications(self, patient_id, medications):
        """
        Process a full list of current medications.
        
        Args:
            patient_id: Patient identifier
            medications: List of medication records
        """
        try:
            if not medications:
                return
            
            # Clear existing medications and insert new ones
            with self.db_engine.connect() as conn:
                # First mark all as discontinued
                query = text("""
                    UPDATE medications
                    SET end_date = NOW(), updated_at = NOW()
                    WHERE patient_id = :patient_id
                    AND end_date IS NULL
                """)
                conn.execute(query, {"patient_id": patient_id})
                
                # Insert new medication records
                for med in medications:
                    query = text("""
                        INSERT INTO medications (
                            patient_id, name, dosage, frequency, route, start_date
                        )
                        VALUES (
                            :patient_id, :name, :dosage, :frequency, :route, :start_date
                        )
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "name": med.get('name'),
                        "dosage": med.get('dosage'),
                        "frequency": med.get('frequency'),
                        "route": med.get('route'),
                        "start_date": med.get('start_date')
                    })
                
                conn.commit()
                
            logger.debug(f"Processed {len(medications)} medications for patient {patient_id}")
            
        except SQLAlchemyError as e:
            logger.error(f"Database error in process_all_medications: {str(e)}")
    
    def check_risk_alerts(self, patient_id, risk_scores, timestamp):
        """
        Check if risk scores warrant an alert.
        
        Args:
            patient_id: Patient identifier
            risk_scores: Dictionary of risk scores
            timestamp: Event timestamp
        """
        try:
            # Load alert thresholds from database
            with self.db_engine.connect() as conn:
                query = text("""
                    SELECT setting_value
                    FROM system_settings
                    WHERE setting_key = 'alert_thresholds'
                """)
                result = conn.execute(query)
                row = result.fetchone()
                
                if row:
                    thresholds = json.loads(row[0])
                else:
                    thresholds = ALERT_THRESHOLDS
            
            # Check each risk type against thresholds
            for risk_type in ['deterioration', 'readmission', 'sepsis']:
                risk_value = float(risk_scores.get(risk_type, 0))
                
                if risk_type in thresholds:
                    high_threshold = thresholds[risk_type]['high']
                    medium_threshold = thresholds[risk_type]['medium']
                    
                    if risk_value >= high_threshold:
                        # Generate high priority alert
                        self.generate_alert(patient_id, risk_type, risk_value, 'high', timestamp)
                    elif risk_value >= medium_threshold:
                        # Generate medium priority alert
                        self.generate_alert(patient_id, risk_type, risk_value, 'medium', timestamp)
            
        except Exception as e:
            logger.error(f"Error in check_risk_alerts: {str(e)}")
    
    def check_lab_alert(self, patient_id, lab_data):
        """
        Check if an abnormal lab value warrants an alert.
        
        Args:
            patient_id: Patient identifier
            lab_data: Lab result data
        """
        try:
            test_name = lab_data.get('test_name')
            value = lab_data.get('value')
            normal_min = lab_data.get('normal_min')
            normal_max = lab_data.get('normal_max')
            timestamp = lab_data.get('timestamp')
            
            # Calculate how far outside normal range
            if normal_min is not None and normal_max is not None:
                # Normalized deviation from normal range
                normal_range = normal_max - normal_min
                if normal_range == 0:
                    normal_range = 1  # Avoid division by zero
                
                if value < normal_min:
                    deviation = (normal_min - value) / normal_range
                elif value > normal_max:
                    deviation = (value - normal_max) / normal_range
                else:
                    deviation = 0
                
                # Only alert for significant deviations
                if deviation >= 0.5:
                    priority = 'high' if deviation >= 1.0 else 'medium'
                    
                    # Generate lab alert
                    message = f"Abnormal {test_name} result: {value} {lab_data.get('unit', '')} (normal range: {normal_min}-{normal_max})"
                    recommended_action = "Review lab results"
                    
                    self.generate_alert(
                        patient_id, 
                        f"lab_{test_name.lower()}", 
                        deviation, 
                        priority, 
                        timestamp,
                        message,
                        recommended_action
                    )
            
        except Exception as e:
            logger.error(f"Error in check_lab_alert: {str(e)}")
    
    def generate_alert(self, patient_id, risk_type, risk_score, priority, timestamp, 
                      message=None, recommended_action=None):
        """
        Generate and store a patient alert.
        
        Args:
            patient_id: Patient identifier
            risk_type: Type of risk (deterioration, readmission, sepsis, lab_*)
            risk_score: Numeric risk score or deviation
            priority: Alert priority (high, medium, low)
            timestamp: Event timestamp
            message: Optional alert message
            recommended_action: Optional recommended action
        """
        try:
            # Check for recent similar alerts to avoid duplicates
            with self.db_engine.connect() as conn:
                query = text("""
                    SELECT id FROM alerts
                    WHERE patient_id = :patient_id
                    AND risk_type = :risk_type
                    AND status = 'active'
                    AND timestamp > :cutoff_time
                """)
                
                # Use 4 hours as cutoff for duplicate alerts
                cutoff_time = datetime.datetime.fromisoformat(timestamp) - datetime.timedelta(hours=4)
                result = conn.execute(query, {
                    "patient_id": patient_id,
                    "risk_type": risk_type,
                    "cutoff_time": cutoff_time.isoformat()
                })
                
                # If recent alert exists, don't create a duplicate
                if result.fetchone():
                    logger.debug(f"Skipping duplicate alert for {patient_id} {risk_type}")
                    return
            
            # Generate default message if none provided
            if message is None:
                if risk_type == 'deterioration':
                    message = f"High risk of clinical deterioration detected (score: {risk_score:.2f})"
                elif risk_type == 'readmission':
                    message = f"High risk of readmission detected (score: {risk_score:.2f})"
                elif risk_type == 'sepsis':
                    message = f"High risk of sepsis detected (score: {risk_score:.2f})"
                else:
                    message = f"Elevated {risk_type} risk detected (score: {risk_score:.2f})"
            
            # Generate default recommended action if none provided
            if recommended_action is None:
                if risk_type == 'deterioration':
                    recommended_action = "Review patient condition and vital signs"
                elif risk_type == 'readmission':
                    recommended_action = "Review discharge planning and follow-up care"
                elif risk_type == 'sepsis':
                    recommended_action = "Assess for signs of infection and sepsis criteria"
                else:
                    recommended_action = "Clinical review recommended"
            
            # Insert alert into database
            with self.db_engine.connect() as conn:
                query = text("""
                    INSERT INTO alerts (
                        patient_id, timestamp, risk_type, risk_score,
                        priority, message, recommended_action, status
                    )
                    VALUES (
                        :patient_id, :timestamp, :risk_type, :risk_score,
                        :priority, :message, :recommended_action, 'active'
                    )
                    RETURNING id
                """)
                
                result = conn.execute(query, {
                    "patient_id": patient_id,
                    "timestamp": timestamp,
                    "risk_type": risk_type,
                    "risk_score": risk_score,
                    "priority": priority,
                    "message": message,
                    "recommended_action": recommended_action
                })
                
                alert_id = result.fetchone()[0]
                conn.commit()
            
            logger.info(f"Generated {priority} priority {risk_type} alert for patient {patient_id}")
            
            # In a real system, we would notify relevant users here
            # For example, by sending events to a notification service
            # that handles email, SMS, or in-app notifications
            
            return alert_id
            
        except Exception as e:
            logger.error(f"Error in generate_alert: {str(e)}")
            return None
    
    def run(self):
        """Run the data processor continuously."""
        logger.info("Starting HealthPulse data processor")
        
        # Initialize Kafka consumers
        self.initialize_kafka_consumers()
        
        try:
            # Process messages continuously
            while True:
                # Process patient data messages
                if PATIENT_DATA_TOPIC in self.consumers:
                    consumer = self.consumers[PATIENT_DATA_TOPIC]
                    messages = consumer.poll(timeout_ms=100, max_records=10)
                    for tp, records in messages.items():
                        for message in records:
                            self.process_patient_data(message)
                
                # Process vitals messages
                if VITALS_TOPIC in self.consumers:
                    consumer = self.consumers[VITALS_TOPIC]
                    messages = consumer.poll(timeout_ms=100, max_records=50)
                    for tp, records in messages.items():
                        for message in records:
                            self.process_vitals(message)
                
                # Process labs messages
                if LABS_TOPIC in self.consumers:
                    consumer = self.consumers[LABS_TOPIC]
                    messages = consumer.poll(timeout_ms=100, max_records=20)
                    for tp, records in messages.items():
                        for message in records:
                            self.process_labs(message)
                
                # Process medications messages
                if MEDICATIONS_TOPIC in self.consumers:
                    consumer = self.consumers[MEDICATIONS_TOPIC]
                    messages = consumer.poll(timeout_ms=100, max_records=10)
                    for tp, records in messages.items():
                        for message in records:
                            self.process_medication(message)
                
                # Brief pause to avoid CPU spinning
                time.sleep(0.01)
                
        except KeyboardInterrupt:
            logger.info("Stopping processor due to user interrupt")
        except Exception as e:
            logger.error(f"Error in processor main loop: {str(e)}", exc_info=True)
        finally:
            # Clean up resources
            for consumer in self.consumers.values():
                consumer.close()
            
            if hasattr(self, 'influx_client'):
                self.influx_client.close()
            
            logger.info("Data processor stopped")


def main():
    """Main function to initialize and run the processor."""
    processor = DataProcessor()
    processor.run()

if __name__ == "__main__":
    main()
