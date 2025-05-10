#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HealthPulse Analytics ML Model Server

This module provides the FastAPI application for serving ML models
that predict patient risks and provide explanations.
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

import numpy as np
import pandas as pd
import joblib
import shap
import xgboost as xgb
from fastapi import FastAPI, Depends, HTTPException, status, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from jose import JWTError, jwt
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("healthpulse-ml")

# ML Models configuration
MODEL_PATH = os.getenv('MODEL_PATH', '/app/models')
 
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

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'healthpulse-super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', '30'))

# OAuth2 for authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI app
app = FastAPI(
    title="HealthPulse Analytics ML API",
    description="API for healthcare predictive analytics",
    version="1.0.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    username: str
    name: str
    role: str
    department: Optional[str] = None

class User(UserBase):
    id: str
    email: str

class RiskScore(BaseModel):
    patient_id: str
    risk_type: str
    score: float
    timestamp: str

class PredictionRequest(BaseModel):
    patient_id: str
    features: Dict[str, Any]

class ExplanationRequest(BaseModel):
    patient_id: str
    risk_type: str
    features: Optional[Dict[str, Any]] = None

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class ExplanationResponse(BaseModel):
    patient_id: str
    risk_type: str
    score: float
    timestamp: str
    global_importance: List[FeatureImportance]
    patient_specific: List[Dict[str, Any]]
    similar_cases: Optional[int] = None
    recommendation: Optional[str] = None

class AlertThresholds(BaseModel):
    deterioration: Dict[str, float]
    readmission: Dict[str, float]
    sepsis: Dict[str, float]

class AlertThresholdUpdate(BaseModel):
    thresholds: Dict[str, Dict[str, float]]

# ML Model classes
class RiskModel:
    """Base class for risk prediction models"""
    
    def __init__(self, risk_type: str):
        """
        Initialize the risk model.
        
        Args:
            risk_type: Type of risk to predict (deterioration, readmission, sepsis)
        """
        self.risk_type = risk_type
        self.model_path = os.path.join(MODEL_PATH, risk_type)
        self.model = None
        self.feature_names = []
        self.explainer = None
        
        self.load_model()
    
    def load_model(self):
        """Load the trained model and explainer from disk"""
        try:
            # Load model
            model_file = os.path.join(self.model_path, 'model.joblib')
            if not os.path.exists(model_file):
                # For demonstration, create a simple model if none exists
                logger.warning(f"No saved model found for {self.risk_type}, creating demo model")
                self.create_demo_model()
            else:
                self.model = joblib.load(model_file)
                
            # Load feature names
            features_file = os.path.join(self.model_path, 'features.json')
            if os.path.exists(features_file):
                with open(features_file, 'r') as f:
                    self.feature_names = json.load(f)
            
            # Load or create SHAP explainer
            explainer_file = os.path.join(self.model_path, 'explainer.joblib')
            if os.path.exists(explainer_file):
                self.explainer = joblib.load(explainer_file)
            else:
                logger.warning(f"No saved explainer found for {self.risk_type}")
                # We'll create explainer on first use if needed
            
            logger.info(f"Loaded model for {self.risk_type} risk prediction")
            
        except Exception as e:
            logger.error(f"Error loading model for {self.risk_type}: {str(e)}")
            # Fall back to demo model
            self.create_demo_model()
    
    def create_demo_model(self):
        """Create a simple model for demonstration purposes"""
        import xgboost as xgb
        import numpy as np
        
        # Define feature names based on risk type
        if self.risk_type == 'deterioration':
            self.feature_names = [
                'heart_rate', 'systolic_bp', 'diastolic_bp', 'temperature', 
                'respiration_rate', 'o2_saturation', 'age', 'comorbidity_count',
                'wbc', 'lactate', 'has_infection'
            ]
        elif self.risk_type == 'readmission':
            self.feature_names = [
                'age', 'length_of_stay', 'comorbidity_count', 'previous_admission_count',
                'discharge_disposition', 'insurance_type', 'medication_count',
                'follow_up_scheduled', 'lives_alone'
            ]
        elif self.risk_type == 'sepsis':
            self.feature_names = [
                'heart_rate', 'temperature', 'respiration_rate', 'wbc', 
                'systolic_bp', 'lactate', 'age', 'has_infection',
                'immunocompromised', 'recent_surgery'
            ]
        
        # Create a simple XGBoost model
        # This is just a placeholder and won't make accurate predictions
        self.model = xgb.XGBClassifier(n_estimators=10, max_depth=3)
        
        # Create some synthetic training data
        num_samples = 100
        np.random.seed(42)
        X = np.random.rand(num_samples, len(self.feature_names))
        # Make y dependent on some features for basic patterns
        y = (X[:, 0] > 0.7) | (X[:, 1] < 0.3) | (X[:, 2] > 0.8)
        
        # Fit the demo model
        self.model.fit(X, y)
        
        # Create a SHAP explainer
        self.explainer = shap.TreeExplainer(self.model)
        
        # Save the demo model and features
        os.makedirs(self.model_path, exist_ok=True)
        joblib.dump(self.model, os.path.join(self.model_path, 'model.joblib'))
        with open(os.path.join(self.model_path, 'features.json'), 'w') as f:
            json.dump(self.feature_names, f)
        joblib.dump(self.explainer, os.path.join(self.model_path, 'explainer.joblib'))
        
        logger.info(f"Created demo model for {self.risk_type}")
    
    def prepare_features(self, raw_features: Dict[str, Any]) -> np.ndarray:
        """
        Prepare features for prediction.
        
        Args:
            raw_features: Dictionary of feature values
            
        Returns:
            Numpy array of feature values in the correct order
        """
        # Initialize features array with zeros
        X = np.zeros((1, len(self.feature_names)))
        
        # Fill in available features
        for i, feature in enumerate(self.feature_names):
            if feature in raw_features:
                X[0, i] = raw_features[feature]
        
        return X
    
    def predict(self, features: Dict[str, Any]) -> float:
        """
        Make risk prediction.
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Risk score between 0 and 1
        """
        if not self.model:
            raise ValueError(f"Model for {self.risk_type} not loaded")
        
        # Prepare features
        X = self.prepare_features(features)
        
        # Make prediction
        if hasattr(self.model, 'predict_proba'):
            # For classifiers that output probabilities
            prob = self.model.predict_proba(X)[0, 1]  # Probability of class 1
            return float(prob)
        else:
            # For regression models
            pred = self.model.predict(X)[0]
            # Ensure output is between 0 and 1
            return float(max(0, min(1, pred)))
    
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate explanation for prediction.
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Dictionary with explanation details
        """
        if not self.model:
            raise ValueError(f"Model for {self.risk_type} not loaded")
        
        # Create explainer if not already created
        if not self.explainer:
            if hasattr(self.model, 'get_booster'):
                self.explainer = shap.TreeExplainer(self.model)
            else:
                # For non-tree models, use KernelExplainer with background data
                # This is simplified - in production would use real background data
                background_data = np.zeros((10, len(self.feature_names)))
                self.explainer = shap.KernelExplainer(self.model.predict, background_data)
        
        # Prepare features
        X = self.prepare_features(features)
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X)
        
        # Handle different output formats from different explainers
        if isinstance(shap_values, list):
            if len(shap_values) == 2:  # For binary classification
                shap_values = shap_values[1]  # Use class 1 (positive class)
            else:
                shap_values = shap_values[0]
        
        # Flatten if needed
        if shap_values.ndim > 1:
            shap_values = shap_values[0]
        
        # Create explanation
        feature_importance = []
        for i, feature in enumerate(self.feature_names):
            feature_importance.append({
                'feature': feature,
                'importance': abs(float(shap_values[i])),
                'value': float(X[0, i]),
                'contribution': float(shap_values[i])
            })
        
        # Sort by absolute importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Global importance (common for the model)
        global_importance = []
        for item in feature_importance[:10]:  # Top 10 features
            global_importance.append({
                'feature': item['feature'],
                'importance': item['importance']
            })
        
        # Patient-specific factors
        patient_specific = []
        for item in feature_importance[:5]:  # Top 5 features
            specific_item = {
                'feature': item['feature'],
                'value': item['value'],
                'contribution': item['contribution']
            }
            
            # Add normal ranges for common vital signs
            if item['feature'] == 'heart_rate':
                specific_item['normal_range'] = '60-100'
            elif item['feature'] == 'systolic_bp':
                specific_item['normal_range'] = '90-120'
            elif item['feature'] == 'diastolic_bp':
                specific_item['normal_range'] = '60-80'
            elif item['feature'] == 'temperature':
                specific_item['normal_range'] = '36.1-37.2'
            elif item['feature'] == 'respiration_rate':
                specific_item['normal_range'] = '12-20'
            elif item['feature'] == 'o2_saturation':
                specific_item['normal_range'] = '95-100'
            
            patient_specific.append(specific_item)
        
        # Generate recommendations based on risk type and important features
        recommendation = self.generate_recommendation(features, feature_importance)
        
        return {
            'global_importance': global_importance,
            'patient_specific': patient_specific,
            'similar_cases': 15,  # In a real system, would calculate this
            'recommendation': recommendation
        }
    
    def generate_recommendation(self, features: Dict[str, Any], 
                               importance: List[Dict[str, Any]]) -> str:
        """
        Generate clinical recommendation based on risk factors.
        
        Args:
            features: Dictionary of feature values
            importance: List of feature importance details
            
        Returns:
            Recommendation string
        """
        # Extract top features by importance
        top_features = [item['feature'] for item in importance[:3]]
        
        # Risk-specific recommendations
        if self.risk_type == 'deterioration':
            if 'respiration_rate' in top_features or 'o2_saturation' in top_features:
                return "Consider respiratory assessment and oxygen therapy evaluation."
            elif 'heart_rate' in top_features or 'systolic_bp' in top_features:
                return "Monitor cardiovascular status and consider fluid management assessment."
            elif 'temperature' in top_features:
                return "Evaluate for potential infection and consider antimicrobial therapy."
            else:
                return "Regular monitoring of vital signs and clinical assessment recommended."
                
        elif self.risk_type == 'readmission':
            if 'comorbidity_count' in top_features:
                return "Review chronic disease management and medication reconciliation."
            elif 'follow_up_scheduled' in top_features:
                return "Ensure follow-up appointment is scheduled within 7 days of discharge."
            elif 'lives_alone' in top_features:
                return "Consider home health evaluation or community support services."
            else:
                return "Review discharge plan and ensure patient education on warning signs."
                
        elif self.risk_type == 'sepsis':
            if 'wbc' in top_features or 'has_infection' in top_features:
                return "Obtain cultures before antibiotics and consider empiric antimicrobial therapy."
            elif 'lactate' in top_features:
                return "Monitor lactate levels and consider fluid resuscitation."
            else:
                return "Monitor for signs of infection and systemic inflammatory response."
        
        # Default recommendation
        return "Clinical review recommended based on risk score."


# Database access class
class DatabaseAccess:
    """Handles database operations for the model server"""
    
    def __init__(self):
        """Initialize database connections"""
        try:
            # PostgreSQL connection
            self.db_engine = create_engine(POSTGRES_URI)
            # Test connection
            with self.db_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to PostgreSQL database")
            
            # InfluxDB connection
            self.influx_client = InfluxDBClient(
                url=INFLUXDB_URL,
                token=INFLUXDB_TOKEN,
                org=INFLUXDB_ORG
            )
            self.influx_write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
            logger.info("Connected to InfluxDB")
            
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            raise
    
    def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """
        Retrieve patient data from the database.
        
        Args:
            patient_id: Patient identifier
            
        Returns:
            Dictionary of patient data
        """
        try:
            with self.db_engine.connect() as conn:
                # Get basic patient information
                query = text("""
                    SELECT p.*, 
                           COUNT(c.id) as comorbidity_count
                    FROM patients p
                    LEFT JOIN comorbidities c ON p.patient_id = c.patient_id
                    WHERE p.patient_id = :patient_id
                    GROUP BY p.patient_id
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                patient_row = result.mappings().first()
                
                if not patient_row:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Patient {patient_id} not found"
                    )
                
                # Convert to dict
                patient_data = dict(patient_row)
                
                # Get diagnoses
                query = text("""
                    SELECT diagnosis FROM diagnoses
                    WHERE patient_id = :patient_id
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                patient_data['diagnoses'] = [row[0] for row in result]
                
                # Get comorbidities
                query = text("""
                    SELECT condition FROM comorbidities
                    WHERE patient_id = :patient_id
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                patient_data['comorbidities'] = [row[0] for row in result]
                
                # Get latest vitals
                query = text("""
                    SELECT * FROM vitals
                    WHERE patient_id = :patient_id
                    ORDER BY timestamp DESC
                    LIMIT 1
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                vitals_row = result.mappings().first()
                
                if vitals_row:
                    patient_data['latest_vitals'] = dict(vitals_row)
                
                # Get active medications
                query = text("""
                    SELECT name, dosage, frequency, route
                    FROM medications
                    WHERE patient_id = :patient_id
                    AND (end_date IS NULL OR end_date > NOW())
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                patient_data['medications'] = [dict(row) for row in result.mappings()]
                
                # Get latest lab results
                query = text("""
                    SELECT 
                        test_name, 
                        value, 
                        unit,
                        timestamp,
                        is_abnormal
                    FROM (
                        SELECT 
                            test_name, 
                            value, 
                            unit,
                            timestamp,
                            is_abnormal,
                            ROW_NUMBER() OVER (PARTITION BY test_name ORDER BY timestamp DESC) as rn
                        FROM lab_results
                        WHERE patient_id = :patient_id
                    ) t
                    WHERE rn = 1
                    ORDER BY test_name
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                patient_data['latest_labs'] = [dict(row) for row in result.mappings()]
                
                # Get latest risk scores
                query = text("""
                    SELECT 
                        deterioration_risk,
                        readmission_risk,
                        sepsis_risk,
                        timestamp
                    FROM risk_scores
                    WHERE patient_id = :patient_id
                    ORDER BY timestamp DESC
                    LIMIT 1
                """)
                
                result = conn.execute(query, {"patient_id": patient_id})
                risk_row = result.mappings().first()
                
                if risk_row:
                    patient_data['latest_risk_scores'] = dict(risk_row)
                
                return patient_data
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving patient data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while retrieving patient data"
            )
    
    def get_patient_features(self, patient_id: str, risk_type: str) -> Dict[str, Any]:
        """
        Extract features for prediction from patient data.
        
        Args:
            patient_id: Patient identifier
            risk_type: Type of risk to predict
            
        Returns:
            Dictionary of features for the specified risk model
        """
        # Get all patient data
        patient_data = self.get_patient_data(patient_id)
        
        # Extract common features
        features = {
            'age': patient_data.get('age', 0),
            'gender_male': 1 if patient_data.get('gender') == 'male' else 0,
            'gender_female': 1 if patient_data.get('gender') == 'female' else 0,
            'comorbidity_count': len(patient_data.get('comorbidities', [])),
        }
        
        # Extract vitals if available
        if 'latest_vitals' in patient_data:
            vitals = patient_data['latest_vitals']
            features.update({
                'heart_rate': vitals.get('heart_rate'),
                'systolic_bp': vitals.get('systolic_bp'),
                'diastolic_bp': vitals.get('diastolic_bp'),
                'temperature': vitals.get('temperature'),
                'respiration_rate': vitals.get('respiration_rate'),
                'o2_saturation': vitals.get('o2_saturation'),
            })
        
        # Extract lab values if available
        if 'latest_labs' in patient_data:
            for lab in patient_data['latest_labs']:
                features[lab['test_name'].lower()] = lab['value']
        
        # Risk-specific features
        if risk_type == 'deterioration':
            # Add deterioration-specific features
            pass
        
        elif risk_type == 'readmission':
            # Readmission risk needs additional features like previous admissions
            try:
                with self.db_engine.connect() as conn:
                    # Count previous admissions in last year
                    query = text("""
                        SELECT COUNT(*) FROM patients
                        WHERE mrn = :mrn
                        AND admission_date > NOW() - INTERVAL '1 year'
                        AND admission_date < :current_admission
                    """)
                    
                    result = conn.execute(query, {
                        "mrn": patient_data.get('mrn'),
                        "current_admission": patient_data.get('admission_date')
                    })
                    
                    prev_admissions = result.scalar() or 0
                    features['previous_admission_count'] = prev_admissions
                    
            except Exception as e:
                logger.error(f"Error getting previous admissions: {str(e)}")
                features['previous_admission_count'] = 0
        
        elif risk_type == 'sepsis':
            # Sepsis risk needs infection indicators
            diagnoses = [d.lower() for d in patient_data.get('diagnoses', [])]
            features['has_infection'] = 1 if any('infection' in d or 'sepsis' in d for d in diagnoses) else 0
            
            # Check for fever
            if 'temperature' in features:
                features['has_fever'] = 1 if features['temperature'] > 38.0 else 0
        
        return features
    
    def store_prediction(self, patient_id: str, risk_type: str, 
                        score: float, features: Dict[str, Any]):
        """
        Store prediction in the database.
        
        Args:
            patient_id: Patient identifier
            risk_type: Type of risk predicted
            score: Predicted risk score
            features: Features used for prediction
        """
        try:
            timestamp = datetime.now().isoformat()
            
            # Store in InfluxDB for time-series analysis
            point = Point("predictions") \
                .tag("patient_id", patient_id) \
                .tag("risk_type", risk_type) \
                .field("score", score) \
                .time(timestamp)
            
            self.influx_write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            
            # For certain risk types, we also update the risk_scores table
            if risk_type in ['deterioration', 'readmission', 'sepsis']:
                with self.db_engine.connect() as conn:
                    # Get latest risk scores
                    query = text("""
                        SELECT 
                            deterioration_risk,
                            readmission_risk,
                            sepsis_risk
                        FROM risk_scores
                        WHERE patient_id = :patient_id
                        ORDER BY timestamp DESC
                        LIMIT 1
                    """)
                    
                    result = conn.execute(query, {"patient_id": patient_id})
                    row = result.mappings().first()
                    
                    # Use existing values or defaults
                    if row:
                        risk_scores = dict(row)
                    else:
                        risk_scores = {
                            'deterioration_risk': 0.1,
                            'readmission_risk': 0.1,
                            'sepsis_risk': 0.1
                        }
                    
                    # Update with new prediction
                    risk_scores[f"{risk_type}_risk"] = score
                    
                    # Insert new risk score row
                    query = text("""
                        INSERT INTO risk_scores (
                            patient_id, 
                            timestamp,
                            deterioration_risk,
                            readmission_risk,
                            sepsis_risk
                        )
                        VALUES (
                            :patient_id, 
                            :timestamp,
                            :deterioration_risk,
                            :readmission_risk,
                            :sepsis_risk
                        )
                    """)
                    
                    conn.execute(query, {
                        "patient_id": patient_id,
                        "timestamp": timestamp,
                        "deterioration_risk": risk_scores['deterioration_risk'],
                        "readmission_risk": risk_scores['readmission_risk'],
                        "sepsis_risk": risk_scores['sepsis_risk']
                    })
                    
                    conn.commit()
            
            logger.info(f"Stored {risk_type} prediction of {score:.2f} for patient {patient_id}")
            
        except Exception as e:
            logger.error(f"Error storing prediction: {str(e)}")
    
    def get_alert_thresholds(self) -> Dict[str, Dict[str, float]]:
        """
        Get current alert thresholds from database.
        
        Returns:
            Dictionary of risk thresholds
        """
        try:
            with self.db_engine.connect() as conn:
                query = text("""
                    SELECT setting_value
                    FROM system_settings
                    WHERE setting_key = 'alert_thresholds'
                """)
                
                result = conn.execute(query)
                row = result.fetchone()
                
                if row:
                    return json.loads(row[0])
                else:
                    # Return default thresholds
                    return {
                        'deterioration': {'high': 0.7, 'medium': 0.4},
                        'readmission': {'high': 0.8, 'medium': 0.5},
                        'sepsis': {'high': 0.6, 'medium': 0.3}
                    }
                    
        except Exception as e:
            logger.error(f"Error retrieving alert thresholds: {str(e)}")
            # Return default thresholds
            return {
                'deterioration': {'high': 0.7, 'medium': 0.4},
                'readmission': {'high': 0.8, 'medium': 0.5},
                'sepsis': {'high': 0.6, 'medium': 0.3}
            }
    
    def update_alert_thresholds(self, thresholds: Dict[str, Dict[str, float]]) -> bool:
        """
        Update alert thresholds in database.
        
        Args:
            thresholds: Dictionary of risk thresholds
            
        Returns:
            True if successful
        """
        try:
            with self.db_engine.connect() as conn:
                query = text("""
                    UPDATE system_settings
                    SET setting_value = :setting_value,
                        updated_at = NOW()
                    WHERE setting_key = 'alert_thresholds'
                """)
                
                conn.execute(query, {
                    "setting_value": json.dumps(thresholds)
                })
                
                conn.commit()
                
                logger.info("Updated alert thresholds")
                return True
                
        except Exception as e:
            logger.error(f"Error updating alert thresholds: {str(e)}")
            return False
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Get user information by username.
        
        Args:
            username: Username to look up
            
        Returns:
            User data or None if not found
        """
        try:
            with self.db_engine.connect() as conn:
                query = text("""
                    SELECT id, username, password_hash, name, role, department, email
                    FROM users
                    WHERE username = :username
                """)
                
                result = conn.execute(query, {"username": username})
                row = result.mappings().first()
                
                if row:
                    return dict(row)
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving user: {str(e)}")
            return None

# Authentication functions
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token.
    
    Args:
        data: Token payload
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get current user from token.
    
    Args:
        token: JWT token
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        token_data = TokenData(username=username, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
    
    db = DatabaseAccess()
    user = db.get_user_by_username(token_data.username)
    
    if user is None:
        raise credentials_exception
    
    return User(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        role=user["role"],
        department=user["department"],
        email=user["email"]
    )

# Initialize models
risk_models = {}
def get_risk_model(risk_type: str) -> RiskModel:
    """
    Get or initialize a risk model.
    
    Args:
        risk_type: Type of risk model
        
    Returns:
        RiskModel instance
    """
    if risk_type not in risk_models:
        risk_models[risk_type] = RiskModel(risk_type)
    return risk_models[risk_type]

# Database singleton
db = DatabaseAccess()

# API routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint for obtaining JWT token.
    
    Args:
        form_data: Username and password
        
    Returns:
        Access token
        
    Raises:
        HTTPException: If authentication fails
    """
    import hashlib
    
    user = db.get_user_by_username(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In production, use proper password hashing like bcrypt
    # For demo purposes, we're using a simpler check
    # Usually password_hash would be verified using a library function
    # For example: bcrypt.checkpw(form_data.password.encode(), user["password_hash"].encode())
    
    # For demo purposes
    password_matched = True  # Always authenticate in demo mode
    
    if not password_matched:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user.
    
    Args:
        current_user: User from token
        
    Returns:
        User object
    """
    return current_user

@app.post("/predict/{risk_type}", response_model=RiskScore)
async def predict_risk(
    risk_type: str,
    request: Optional[PredictionRequest] = None,
    patient_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """
    Predict risk score for a patient.
    
    Args:
        risk_type: Type of risk to predict
        request: Prediction request with features
        patient_id: Patient ID (if features not provided)
        current_user: Authenticated user
        
    Returns:
        Risk score object
    """
    if risk_type not in ['deterioration', 'readmission', 'sepsis']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid risk type: {risk_type}"
        )
    
    # Get features from request or database
    if request and request.features:
        patient_id = request.patient_id
        features = request.features
    elif patient_id:
        features = db.get_patient_features(patient_id, risk_type)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either request body with features or patient_id query parameter is required"
        )
    
    # Get risk model
    model = get_risk_model(risk_type)
    
    # Make prediction
    score = model.predict(features)
    
    # Store prediction
    timestamp = datetime.now().isoformat()
    db.store_prediction(patient_id, risk_type, score, features)
    
    return {
        "patient_id": patient_id,
        "risk_type": risk_type,
        "score": score,
        "timestamp": timestamp
    }

@app.post("/explain/{risk_type}", response_model=ExplanationResponse)
async def explain_prediction(
    risk_type: str,
    request: ExplanationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Explain a risk prediction.
    
    Args:
        risk_type: Type of risk to explain
        request: Explanation request
        current_user: Authenticated user
        
    Returns:
        Explanation details
    """
    patient_id = request.patient_id
    
    # Get features from request or database
    if request.features:
        features = request.features
    else:
        features = db.get_patient_features(patient_id, risk_type)
    
    # Get risk model
    model = get_risk_model(risk_type)
    
    # Make prediction
    score = model.predict(features)
    
    # Generate explanation
    explanation = model.explain(features)
    timestamp = datetime.now().isoformat()
    
    return {
        "patient_id": patient_id,
        "risk_type": risk_type,
        "score": score,
        "timestamp": timestamp,
        "global_importance": explanation['global_importance'],
        "patient_specific": explanation['patient_specific'],
        "similar_cases": explanation['similar_cases'],
        "recommendation": explanation['recommendation']
    }

@app.get("/settings/alert-thresholds", response_model=AlertThresholds)
async def get_thresholds(current_user: User = Depends(get_current_user)):
    """
    Get alert threshold settings.
    
    Args:
        current_user: Authenticated user
        
    Returns:
        Alert threshold settings
    """
    thresholds = db.get_alert_thresholds()
    return thresholds

@app.patch("/settings/alert-thresholds")
async def update_thresholds(
    request: AlertThresholdUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update alert threshold settings.
    
    Args:
        request: New threshold values
        current_user: Authenticated user
        
    Returns:
        Updated thresholds
    """
    # Check permission (only admins can update)
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update thresholds"
        )
    
    # Get current thresholds
    current_thresholds = db.get_alert_thresholds()
    
    # Update with new values
    for risk_type, thresholds in request.thresholds.items():
        if risk_type in current_thresholds:
            for level, value in thresholds.items():
                if level in current_thresholds[risk_type]:
                    current_thresholds[risk_type][level] = value
    
    # Save updated thresholds
    success = db.update_alert_thresholds(current_thresholds)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update thresholds"
        )
    
    return {
        "updated": True,
        "thresholds": current_thresholds
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Service health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
