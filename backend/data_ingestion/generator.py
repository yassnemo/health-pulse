#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Patient Data Generator for HealthPulse Analytics

This script generates synthetic patient data and streams it to Kafka for
real-time processing in the HealthPulse Analytics platform.
"""

import os
import time
import json
import random
import datetime
import logging
from typing import Dict, List, Any, Optional, Tuple

import numpy as np
import pandas as pd
from faker import Faker
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092')
PATIENT_DATA_TOPIC = os.getenv('PATIENT_DATA_TOPIC', 'patient-data')
VITALS_TOPIC = os.getenv('VITALS_TOPIC', 'patient-vitals')
LABS_TOPIC = os.getenv('LABS_TOPIC', 'patient-labs')
MEDICATIONS_TOPIC = os.getenv('MEDICATIONS_TOPIC', 'patient-medications')

# Simulation settings
NUM_PATIENTS = int(os.getenv('NUM_PATIENTS', '50'))
DATA_INTERVAL_SECONDS = int(os.getenv('DATA_INTERVAL_SECONDS', '5'))
USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

# Create Faker instance for generating synthetic data
fake = Faker()
Faker.seed(42)  # For reproducibility
random.seed(42)
np.random.seed(42)

# Initialize Kafka producer
try:
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda k: k.encode('utf-8') if k else None,
        acks='all',
        retries=3
    )
    logger.info(f"Connected to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
except Exception as e:
    logger.error(f"Failed to connect to Kafka: {str(e)}")
    raise

class PatientDataGenerator:
    """Generates synthetic patient data for simulation purposes."""
    
    # Constants for data generation
    DEPARTMENTS = [
        "Emergency", "Cardiology", "Neurology", "Oncology", 
        "Surgery", "Internal Medicine", "Pediatrics", "ICU"
    ]
    
    DIAGNOSES = {
        "Cardiology": [
            "Acute Myocardial Infarction", "Congestive Heart Failure",
            "Atrial Fibrillation", "Hypertension", "Coronary Artery Disease"
        ],
        "Neurology": [
            "Stroke", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease",
            "Alzheimer's Disease", "Migraine"
        ],
        "Oncology": [
            "Lung Cancer", "Breast Cancer", "Colorectal Cancer",
            "Leukemia", "Lymphoma", "Prostate Cancer"
        ],
        "Emergency": [
            "Trauma", "Acute Respiratory Failure", "Sepsis",
            "Drug Overdose", "Acute Appendicitis"
        ],
        "Surgery": [
            "Appendectomy", "Cholecystectomy", "Hip Replacement",
            "Knee Replacement", "Hernia Repair"
        ],
        "Internal Medicine": [
            "Pneumonia", "Diabetes", "COPD", "Kidney Disease",
            "Liver Cirrhosis", "Thyroid Disorder"
        ],
        "Pediatrics": [
            "Asthma", "Bronchiolitis", "Otitis Media",
            "Gastroenteritis", "Respiratory Tract Infection"
        ],
        "ICU": [
            "Respiratory Failure", "Septic Shock", "Multi-Organ Failure",
            "ARDS", "Post-Surgical Complications"
        ]
    }
    
    LAB_TESTS = {
        "WBC": {"unit": "10^9/L", "normal_min": 4.5, "normal_max": 11.0},
        "Hemoglobin": {"unit": "g/dL", "normal_min": 12.0, "normal_max": 18.0},
        "Platelets": {"unit": "10^9/L", "normal_min": 150, "normal_max": 450},
        "Sodium": {"unit": "mmol/L", "normal_min": 135, "normal_max": 145},
        "Potassium": {"unit": "mmol/L", "normal_min": 3.5, "normal_max": 5.0},
        "Chloride": {"unit": "mmol/L", "normal_min": 98, "normal_max": 107},
        "CO2": {"unit": "mmol/L", "normal_min": 22, "normal_max": 29},
        "BUN": {"unit": "mg/dL", "normal_min": 7, "normal_max": 20},
        "Creatinine": {"unit": "mg/dL", "normal_min": 0.6, "normal_max": 1.2},
        "Glucose": {"unit": "mg/dL", "normal_min": 70, "normal_max": 99},
        "Calcium": {"unit": "mg/dL", "normal_min": 8.5, "normal_max": 10.2}
    }
    
    MEDICATIONS = {
        "Cardiology": [
            "Aspirin", "Metoprolol", "Lisinopril", "Atorvastatin", 
            "Clopidogrel", "Warfarin", "Diltiazem"
        ],
        "Neurology": [
            "Levetiracetam", "Gabapentin", "Memantine", 
            "Sumatriptan", "Carbidopa-Levodopa"
        ],
        "Oncology": [
            "Paclitaxel", "Cisplatin", "Doxorubicin", 
            "Rituximab", "Tamoxifen", "Capecitabine"
        ],
        "Emergency": [
            "Epinephrine", "Norepinephrine", "Naloxone", 
            "Ceftriaxone", "Morphine", "Lorazepam"
        ],
        "Surgery": [
            "Fentanyl", "Propofol", "Midazolam", 
            "Neostigmine", "Cefazolin", "Ketorolac"
        ],
        "Internal Medicine": [
            "Albuterol", "Metformin", "Prednisone", 
            "Insulin", "Levothyroxine", "Furosemide"
        ],
        "Pediatrics": [
            "Amoxicillin", "Albuterol", "Acetaminophen", 
            "Ibuprofen", "Diphenhydramine"
        ],
        "ICU": [
            "Norepinephrine", "Propofol", "Vancomycin", 
            "Piperacillin-Tazobactam", "Insulin", "Pantoprazole"
        ]
    }
    
    def __init__(self):
        """Initialize the patient data generator."""
        self.patients = self.generate_patients(NUM_PATIENTS)
        self.current_time = datetime.datetime.now()
        
        # Time progression coefficients for each patient's condition
        # Positive: condition worsening, Negative: condition improving
        self.condition_progression = {}
        for patient_id in self.patients:
            # Most patients improve, some deteriorate
            self.condition_progression[patient_id] = np.random.normal(
                -0.02, 0.1  # Mean improvement with some variation
            )
            
        # Initialize periodic lab orders for each patient
        self.lab_schedules = {}
        for patient_id in self.patients:
            # Schedule labs every 6-12 hours
            frequency_hours = random.randint(6, 12)
            self.lab_schedules[patient_id] = {
                "frequency_hours": frequency_hours,
                "last_labs": self.current_time - datetime.timedelta(
                    hours=random.randint(0, frequency_hours)
                )
            }
    
    def generate_patients(self, num_patients: int) -> Dict[str, Dict[str, Any]]:
        """
        Generate a set of synthetic patients.
        
        Args:
            num_patients: Number of patients to generate
            
        Returns:
            Dictionary of patient data keyed by patient ID
        """
        patients = {}
        
        for i in range(num_patients):
            patient_id = f"P{100000 + i}"
            mrn = f"MRN{random.randint(10000, 99999)}"
            
            gender = random.choice(['male', 'female'])
            if gender == 'male':
                first_name = fake.first_name_male()
            else:
                first_name = fake.first_name_female()
            
            last_name = fake.last_name()
            
            age = random.randint(18, 90)
            department = random.choice(self.DEPARTMENTS)
            
            # Generate 1-3 diagnoses for the patient
            num_diagnoses = random.randint(1, 3)
            diagnoses = random.sample(
                self.DIAGNOSES[department], 
                min(num_diagnoses, len(self.DIAGNOSES[department]))
            )
            
            # Generate admission date (0-30 days ago)
            days_ago = random.randint(0, 30)
            admission_date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
            
            # Base risk factors - will be dynamically updated
            base_risks = {
                "readmission": round(random.uniform(0.05, 0.4), 2),
                "deterioration": round(random.uniform(0.05, 0.4), 2),
                "sepsis": round(random.uniform(0.05, 0.3), 2)
            }
            
            # Generate comorbidities (0-3)
            comorbidities = []
            possible_comorbidities = [
                "Hypertension", "Diabetes", "COPD", "Asthma", 
                "Obesity", "Chronic Kidney Disease", "Heart Failure"
            ]
            num_comorbidities = random.randint(0, 3)
            if num_comorbidities > 0:
                comorbidities = random.sample(possible_comorbidities, num_comorbidities)
            
            # Attending physician
            attending_physician = f"Dr. {fake.last_name()}"
            
            # Room assignment
            floor = random.choice(["2", "3", "4", "5"])
            wing = random.choice(["A", "B", "C"])
            room_number = random.randint(1, 40)
            room = f"{floor}{wing}-{room_number:02d}"
            
            # Baseline vitals - will be updated dynamically
            vitals_baseline = self.generate_baseline_vitals(age, diagnoses, comorbidities)
            
            # Construct patient record
            patients[patient_id] = {
                "patient_id": patient_id,
                "mrn": mrn,
                "name": f"{first_name} {last_name}",
                "gender": gender,
                "age": age,
                "department": department,
                "room": room,
                "diagnoses": diagnoses,
                "comorbidities": comorbidities,
                "admission_date": admission_date.isoformat(),
                "attending_physician": attending_physician,
                "risk_scores": base_risks,
                "vitals_baseline": vitals_baseline,
                # Medications will be added dynamically
            }
            
            # Generate initial medications based on department and diagnoses
            medications = self.generate_initial_medications(department, diagnoses)
            patients[patient_id]["medications"] = medications
        
        return patients
    
    def generate_baseline_vitals(
        self, age: int, diagnoses: List[str], comorbidities: List[str]
    ) -> Dict[str, Any]:
        """
        Generate baseline vital signs based on patient characteristics.
        
        Args:
            age: Patient age
            diagnoses: List of diagnoses
            comorbidities: List of comorbidities
            
        Returns:
            Dictionary of baseline vital sign values
        """
        # Start with normal ranges
        baseline_vitals = {
            "heart_rate": 75,  # bpm
            "systolic_bp": 120,  # mmHg
            "diastolic_bp": 80,  # mmHg
            "temperature": 37.0,  # Celsius
            "respiration_rate": 16,  # breaths per minute
            "o2_saturation": 98,  # percentage
            "pain_level": 1,  # scale 0-10
        }
        
        # Adjust based on age
        if age > 65:
            baseline_vitals["heart_rate"] += random.uniform(-5, 5)
            baseline_vitals["systolic_bp"] += random.uniform(5, 15)
            baseline_vitals["respiration_rate"] += random.uniform(0, 2)
        elif age < 30:
            baseline_vitals["heart_rate"] += random.uniform(0, 10)
            baseline_vitals["systolic_bp"] += random.uniform(-10, 0)
        
        # Adjust based on diagnoses
        for diagnosis in diagnoses:
            if "Heart" in diagnosis or "Cardio" in diagnosis:
                baseline_vitals["heart_rate"] += random.uniform(-10, 15)
                baseline_vitals["systolic_bp"] += random.uniform(-5, 20)
            elif "Respiratory" in diagnosis or "Pneumonia" in diagnosis or "COPD" in diagnosis:
                baseline_vitals["respiration_rate"] += random.uniform(0, 8)
                baseline_vitals["o2_saturation"] -= random.uniform(0, 10)
            elif "Sepsis" in diagnosis:
                baseline_vitals["heart_rate"] += random.uniform(15, 30)
                baseline_vitals["temperature"] += random.uniform(1, 3)
                baseline_vitals["respiration_rate"] += random.uniform(4, 8)
            elif "Pain" in diagnosis or "Surgery" in diagnosis or "Trauma" in diagnosis:
                baseline_vitals["pain_level"] += random.uniform(3, 8)
                baseline_vitals["heart_rate"] += random.uniform(5, 15)
        
        # Adjust based on comorbidities
        for condition in comorbidities:
            if condition == "Hypertension":
                baseline_vitals["systolic_bp"] += random.uniform(10, 30)
                baseline_vitals["diastolic_bp"] += random.uniform(5, 15)
            elif condition == "COPD" or condition == "Asthma":
                baseline_vitals["respiration_rate"] += random.uniform(0, 6)
                baseline_vitals["o2_saturation"] -= random.uniform(2, 8)
        
        # Add some randomness
        baseline_vitals["heart_rate"] += random.uniform(-5, 5)
        baseline_vitals["systolic_bp"] += random.uniform(-8, 8)
        baseline_vitals["diastolic_bp"] += random.uniform(-5, 5)
        baseline_vitals["temperature"] += random.uniform(-0.2, 0.2)
        baseline_vitals["respiration_rate"] += random.uniform(-2, 2)
        baseline_vitals["o2_saturation"] += random.uniform(-2, 1)
        
        # Ensure values are in reasonable ranges
        baseline_vitals["heart_rate"] = max(40, min(180, baseline_vitals["heart_rate"]))
        baseline_vitals["systolic_bp"] = max(70, min(220, baseline_vitals["systolic_bp"]))
        baseline_vitals["diastolic_bp"] = max(40, min(120, baseline_vitals["diastolic_bp"]))
        baseline_vitals["temperature"] = max(35.0, min(41.0, baseline_vitals["temperature"]))
        baseline_vitals["respiration_rate"] = max(8, min(40, baseline_vitals["respiration_rate"]))
        baseline_vitals["o2_saturation"] = max(70, min(100, baseline_vitals["o2_saturation"]))
        baseline_vitals["pain_level"] = max(0, min(10, round(baseline_vitals["pain_level"])))
        
        # Round values appropriately
        baseline_vitals["heart_rate"] = round(baseline_vitals["heart_rate"])
        baseline_vitals["systolic_bp"] = round(baseline_vitals["systolic_bp"])
        baseline_vitals["diastolic_bp"] = round(baseline_vitals["diastolic_bp"])
        baseline_vitals["temperature"] = round(baseline_vitals["temperature"] * 10) / 10
        baseline_vitals["respiration_rate"] = round(baseline_vitals["respiration_rate"])
        baseline_vitals["o2_saturation"] = round(baseline_vitals["o2_saturation"])
        
        return baseline_vitals
    
    def generate_initial_medications(
        self, department: str, diagnoses: List[str]
    ) -> List[Dict[str, str]]:
        """
        Generate initial medications based on department and diagnoses.
        
        Args:
            department: Hospital department
            diagnoses: List of diagnoses
            
        Returns:
            List of medication records
        """
        medications = []
        
        # Get department-specific medications
        dept_meds = self.MEDICATIONS.get(department, [])
        
        # Select 1-4 medications
        num_medications = random.randint(1, min(4, len(dept_meds)))
        selected_meds = random.sample(dept_meds, num_medications)
        
        for med in selected_meds:
            # Define standard dosages for common medications
            if med == "Aspirin":
                dosage = "81mg"
                frequency = "daily"
                route = "oral"
            elif med == "Metoprolol":
                dosage = f"{random.choice([25, 50, 100])}mg"
                frequency = "twice daily"
                route = "oral"
            elif med == "Lisinopril":
                dosage = f"{random.choice([5, 10, 20])}mg"
                frequency = "daily"
                route = "oral"
            elif med == "Insulin":
                dosage = f"{random.randint(1, 10)} units"
                frequency = "with meals"
                route = "subcutaneous"
            elif "Antibiotic" in med or "cillin" in med:
                dosage = f"{random.choice([250, 500, 1000])}mg"
                frequency = "every 8 hours"
                route = random.choice(["oral", "IV"])
            else:
                # Generic for other medications
                dosage = f"{random.choice([5, 10, 25, 50, 100, 250, 500])}mg"
                frequency = random.choice(["daily", "twice daily", "three times daily", "every 4 hours", "every 6 hours", "every 8 hours"])
                route = random.choice(["oral", "IV", "topical", "subcutaneous", "intramuscular"])
            
            medications.append({
                "name": med,
                "dosage": dosage,
                "frequency": frequency,
                "route": route,
                "start_date": (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 10))).isoformat()
            })
        
        return medications
    
    def generate_vitals(
        self, patient_id: str, timestamp: datetime.datetime
    ) -> Dict[str, Any]:
        """
        Generate vital signs for a patient at a specific time.
        
        Args:
            patient_id: Patient identifier
            timestamp: Timestamp for the vital signs
            
        Returns:
            Dictionary of vital sign measurements
        """
        patient = self.patients[patient_id]
        baseline = patient["vitals_baseline"]
        
        # Calculate time since admission
        admission_time = datetime.datetime.fromisoformat(patient["admission_date"])
        hours_since_admission = (timestamp - admission_time).total_seconds() / 3600
        
        # Get progression coefficient for this patient
        progression = self.condition_progression[patient_id]
        
        # Determine time-dependent change factor
        # Sigmoid function to model initial deterioration followed by improvement
        time_factor = 2.0 / (1 + np.exp(-0.01 * hours_since_admission)) - 1.0
        
        # Combine factors
        change_factor = progression * time_factor
        
        # Generate vitals with variability and progression
        heart_rate = baseline["heart_rate"] + change_factor * 20 + random.uniform(-3, 3)
        systolic_bp = baseline["systolic_bp"] + change_factor * 15 + random.uniform(-5, 5)
        diastolic_bp = baseline["diastolic_bp"] + change_factor * 10 + random.uniform(-3, 3)
        temperature = baseline["temperature"] + change_factor * 1.5 + random.uniform(-0.1, 0.1)
        respiration_rate = baseline["respiration_rate"] + change_factor * 6 + random.uniform(-1, 1)
        o2_saturation = baseline["o2_saturation"] - change_factor * 8 + random.uniform(-1, 1)
        pain_level = min(10, max(0, round(baseline["pain_level"] + change_factor * 3 + random.uniform(-0.5, 0.5))))
        
        # Daily patterns - slight variations based on time of day
        hour_of_day = timestamp.hour
        if 0 <= hour_of_day < 6:  # Night - slower vitals
            heart_rate -= random.uniform(0, 5)
            respiration_rate -= random.uniform(0, 2)
        elif 6 <= hour_of_day < 10:  # Morning - rising
            heart_rate += random.uniform(0, 3)
            systolic_bp += random.uniform(0, 5)
        elif 10 <= hour_of_day < 14:  # Midday - higher
            temperature += random.uniform(0, 0.2)
        elif 20 <= hour_of_day < 24:  # Evening - lowering
            heart_rate -= random.uniform(0, 2)
            
        # Add some randomness for realism
        heart_rate += random.gauss(0, 2)
        systolic_bp += random.gauss(0, 3)
        diastolic_bp += random.gauss(0, 2)
        temperature += random.gauss(0, 0.1)
        respiration_rate += random.gauss(0, 0.5)
        o2_saturation += random.gauss(0, 0.5)
        
        # Ensure values are in reasonable ranges
        heart_rate = max(40, min(180, heart_rate))
        systolic_bp = max(70, min(220, systolic_bp))
        diastolic_bp = max(40, min(120, diastolic_bp))
        temperature = max(35.0, min(41.0, temperature))
        respiration_rate = max(8, min(40, respiration_rate))
        o2_saturation = max(70, min(100, o2_saturation))
        
        # Update risk scores based on vitals
        self.update_risk_scores(patient_id, {
            "heart_rate": heart_rate,
            "systolic_bp": systolic_bp,
            "diastolic_bp": diastolic_bp,
            "temperature": temperature,
            "respiration_rate": respiration_rate,
            "o2_saturation": o2_saturation,
            "pain_level": pain_level
        })
        
        return {
            "patient_id": patient_id,
            "timestamp": timestamp.isoformat(),
            "heart_rate": round(heart_rate),
            "blood_pressure": f"{round(systolic_bp)}/{round(diastolic_bp)}",
            "systolic_bp": round(systolic_bp),
            "diastolic_bp": round(diastolic_bp),
            "temperature": round(temperature * 10) / 10,
            "respiration_rate": round(respiration_rate),
            "o2_saturation": round(o2_saturation),
            "pain_level": pain_level
        }
    
    def generate_labs(self, patient_id: str, timestamp: datetime.datetime) -> List[Dict[str, Any]]:
        """
        Generate laboratory results for a patient.
        
        Args:
            patient_id: Patient identifier
            timestamp: Timestamp for the lab results
            
        Returns:
            List of lab test results
        """
        patient = self.patients[patient_id]
        lab_results = []
        
        # Get patient risk scores to influence lab values
        risk_scores = patient["risk_scores"]
        risk_factor = max(risk_scores["deterioration"], risk_scores["sepsis"])
        
        for test_name, test_info in self.LAB_TESTS.items():
            # Determine normal range
            normal_min = test_info["normal_min"]
            normal_max = test_info["normal_max"]
            
            # Base value within normal range
            base_value = normal_min + (normal_max - normal_min) * random.uniform(0.3, 0.7)
            
            # Apply risk factor to potentially move out of normal range
            if risk_factor > 0.5 and random.random() < risk_factor:
                # High risk - abnormal value
                if random.random() < 0.5:  # 50% chance high, 50% chance low
                    # High value
                    value = normal_max + (normal_max - normal_min) * random.uniform(0.1, 0.5) * risk_factor
                else:
                    # Low value
                    value = normal_min - (normal_max - normal_min) * random.uniform(0.1, 0.5) * risk_factor
            else:
                # Normal range with some variation
                value = base_value + (normal_max - normal_min) * random.gauss(0, 0.1)
            
            # Modify based on specific conditions
            if test_name == "WBC" and "sepsis" in str(patient["diagnoses"]).lower():
                value = normal_max + random.uniform(5, 15)  # Elevated for sepsis
            elif test_name == "Hemoglobin" and "anemia" in str(patient.get("comorbidities", [])).lower():
                value = normal_min - random.uniform(1, 3)  # Low for anemia
            elif test_name == "Glucose" and "diabetes" in str(patient.get("comorbidities", [])).lower():
                value = normal_max + random.uniform(20, 100)  # High for diabetes
            
            result = {
                "patient_id": patient_id,
                "timestamp": timestamp.isoformat(),
                "test_name": test_name,
                "value": round(value, 2),
                "unit": test_info["unit"],
                "normal_range": f"{normal_min}-{normal_max}",
                "is_normal": normal_min <= value <= normal_max
            }
            lab_results.append(result)
        
        return lab_results
    
    def update_medication(self, patient_id: str, timestamp: datetime.datetime) -> Optional[Dict[str, Any]]:
        """
        Potentially update a medication order for a patient.
        
        Args:
            patient_id: Patient identifier
            timestamp: Current timestamp
            
        Returns:
            Medication update record or None if no update
        """
        # Only update medications occasionally (10% chance)
        if random.random() > 0.1:
            return None
        
        patient = self.patients[patient_id]
        department = patient["department"]
        current_medications = patient["medications"]
        
        action = random.choice(["add", "discontinue", "change_dose"])
        
        if action == "add" and len(current_medications) < 10:
            # Add a new medication
            dept_meds = self.MEDICATIONS.get(department, [])
            # Filter out medications the patient is already on
            current_med_names = [med["name"] for med in current_medications]
            available_meds = [med for med in dept_meds if med not in current_med_names]
            
            if available_meds:
                new_med = random.choice(available_meds)
                dosage = f"{random.choice([5, 10, 25, 50, 100, 250, 500])}mg"
                frequency = random.choice(["daily", "twice daily", "three times daily", "every 4 hours", "every 6 hours", "every 8 hours"])
                route = random.choice(["oral", "IV", "topical", "subcutaneous", "intramuscular"])
                
                med_record = {
                    "name": new_med,
                    "dosage": dosage,
                    "frequency": frequency,
                    "route": route,
                    "start_date": timestamp.isoformat()
                }
                
                patient["medications"].append(med_record)
                
                return {
                    "patient_id": patient_id,
                    "timestamp": timestamp.isoformat(),
                    "action": "add",
                    "medication": med_record
                }
        
        elif action == "discontinue" and current_medications:
            # Discontinue a medication
            med_to_remove = random.choice(current_medications)
            patient["medications"].remove(med_to_remove)
            
            return {
                "patient_id": patient_id,
                "timestamp": timestamp.isoformat(),
                "action": "discontinue",
                "medication": med_to_remove
            }
            
        elif action == "change_dose" and current_medications:
            # Change dosage of a medication
            med_to_change = random.choice(current_medications)
            old_dosage = med_to_change["dosage"]
            
            # Parse numeric part of dosage
            try:
                numeric_part = ''.join(filter(str.isdigit, old_dosage))
                units_part = ''.join(filter(str.isalpha, old_dosage))
                
                if numeric_part:
                    old_value = int(numeric_part)
                    # Change by 25-50% up or down
                    change_factor = random.uniform(0.5, 1.5)
                    new_value = max(1, round(old_value * change_factor))
                    
                    med_to_change["dosage"] = f"{new_value}{units_part}"
                    
                    return {
                        "patient_id": patient_id,
                        "timestamp": timestamp.isoformat(),
                        "action": "change_dose",
                        "medication": med_to_change,
                        "old_dosage": old_dosage,
                        "new_dosage": med_to_change["dosage"]
                    }
            except Exception:
                pass
        
        return None
    
    def update_risk_scores(self, patient_id: str, vitals: Dict[str, float]):
        """
        Update risk scores based on vital signs and patient factors.
        
        Args:
            patient_id: Patient identifier
            vitals: Dictionary of vital signs
        """
        patient = self.patients[patient_id]
        
        # Extract current risk scores
        current_risks = patient["risk_scores"]
        
        # Start with current values
        deterioration_risk = current_risks["deterioration"]
        readmission_risk = current_risks["readmission"]
        sepsis_risk = current_risks["sepsis"]
        
        # Extract vital signs
        heart_rate = vitals["heart_rate"]
        systolic_bp = vitals["systolic_bp"]
        diastolic_bp = vitals["diastolic_bp"]
        temperature = vitals["temperature"]
        respiration_rate = vitals["respiration_rate"]
        o2_saturation = vitals["o2_saturation"]
        
        # Deterioration risk factors
        if heart_rate > 100 or heart_rate < 50:
            deterioration_risk += 0.05
        if systolic_bp > 180 or systolic_bp < 90:
            deterioration_risk += 0.08
        if diastolic_bp > 110 or diastolic_bp < 60:
            deterioration_risk += 0.05
        if temperature > 39.0 or temperature < 36.0:
            deterioration_risk += 0.07
        if respiration_rate > 25 or respiration_rate < 10:
            deterioration_risk += 0.1
        if o2_saturation < 92:
            deterioration_risk += 0.15 * (1 - o2_saturation/100)
        
        # Sepsis risk factors (simplified model)
        if heart_rate > 90 and temperature > 38.3:
            sepsis_risk += 0.1
        if heart_rate > 90 and temperature < 36.0:
            sepsis_risk += 0.15
        if respiration_rate > 20:
            sepsis_risk += 0.05
        if systolic_bp < 100:
            sepsis_risk += 0.1
        
        # Patient factors
        age_factor = max(0, min(1, (patient["age"] - 50) / 50))
        if age_factor > 0.5:
            deterioration_risk += 0.02
            readmission_risk += 0.03
            sepsis_risk += 0.02
        
        # Comorbidity factors
        comorbidity_count = len(patient.get("comorbidities", []))
        comorbidity_factor = min(1, comorbidity_count * 0.1)
        deterioration_risk += 0.03 * comorbidity_factor
        readmission_risk += 0.05 * comorbidity_factor
        sepsis_risk += 0.02 * comorbidity_factor
        
        # Add some random drift (for realism)
        deterioration_risk += random.gauss(0, 0.01)
        readmission_risk += random.gauss(0, 0.01)
        sepsis_risk += random.gauss(0, 0.01)
        
        # Ensure scores are within [0, 1] range
        deterioration_risk = max(0, min(1, deterioration_risk))
        readmission_risk = max(0, min(1, readmission_risk))
        sepsis_risk = max(0, min(1, sepsis_risk))
        
        # Update patient record
        patient["risk_scores"] = {
            "deterioration": round(deterioration_risk, 2),
            "readmission": round(readmission_risk, 2),
            "sepsis": round(sepsis_risk, 2)
        }
    
    def step_simulation(self):
        """
        Advance the simulation by one time step, generating data for all patients.
        """
        # Update current time
        self.current_time += datetime.timedelta(seconds=DATA_INTERVAL_SECONDS)
        
        # Process each patient
        for patient_id in self.patients.keys():
            # Generate and send vitals data
            vitals_data = self.generate_vitals(patient_id, self.current_time)
            try:
                producer.send(
                    VITALS_TOPIC,
                    key=patient_id,
                    value=vitals_data
                )
            except KafkaError as e:
                logger.error(f"Error sending vitals data: {str(e)}")
            
            # Check if it's time for labs
            lab_schedule = self.lab_schedules[patient_id]
            hours_since_last_labs = (self.current_time - lab_schedule["last_labs"]).total_seconds() / 3600
            
            if hours_since_last_labs >= lab_schedule["frequency_hours"]:
                # Generate and send lab data
                lab_results = self.generate_labs(patient_id, self.current_time)
                for lab_result in lab_results:
                    try:
                        producer.send(
                            LABS_TOPIC,
                            key=patient_id,
                            value=lab_result
                        )
                    except KafkaError as e:
                        logger.error(f"Error sending lab data: {str(e)}")
                
                # Update last labs time
                self.lab_schedules[patient_id]["last_labs"] = self.current_time
            
            # Check for medication updates
            med_update = self.update_medication(patient_id, self.current_time)
            if med_update:
                try:
                    producer.send(
                        MEDICATIONS_TOPIC,
                        key=patient_id,
                        value=med_update
                    )
                except KafkaError as e:
                    logger.error(f"Error sending medication update: {str(e)}")
            
            # Send current patient state to main topic (periodically)
            if random.random() < 0.05:  # ~5% chance per step
                try:
                    producer.send(
                        PATIENT_DATA_TOPIC,
                        key=patient_id,
                        value=self.patients[patient_id]
                    )
                except KafkaError as e:
                    logger.error(f"Error sending patient data: {str(e)}")
        
        # Flush producer to ensure messages are sent
        producer.flush()


def main():
    """Main function to run the data generator."""
    logger.info(f"Starting HealthPulse patient data generator with {NUM_PATIENTS} patients")
    logger.info(f"Publishing to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
    
    # Create Kafka topics if they don't exist
    # (In production this would be done by Kafka admin)
    
    # Initialize data generator
    generator = PatientDataGenerator()
    
    logger.info("Generator initialized, starting simulation...")
    
    try:
        # Run indefinitely
        while True:
            generator.step_simulation()
            time.sleep(DATA_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("Generator stopped by user")
    except Exception as e:
        logger.error(f"Error in generator: {str(e)}", exc_info=True)
    finally:
        if producer:
            producer.flush()
            producer.close()
            logger.info("Kafka producer closed")


if __name__ == "__main__":
    main()
