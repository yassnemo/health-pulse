#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HealthPulse Analytics API Gateway

This module provides the main API Gateway for the HealthPulse Analytics platform,
handling authentication, authorization, and routing to appropriate services.
"""

import os
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field
import httpx
from prometheus_fastapi_instrumentator import Instrumentator
from starlette_exporter import PrometheusMiddleware, handle_metrics
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("healthpulse-api")

# Constants from environment variables
ML_MODEL_SERVER_URL = os.getenv('ML_MODEL_SERVER_URL', 'http://ml-model-server:8000')
JWT_SECRET = os.getenv('JWT_SECRET', 'healthpulse-super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', '60'))

# PostgreSQL configuration
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'postgres')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'healthpulse')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'healthpulsepassword')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'healthpulse')
POSTGRES_URI = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

# Initialize FastAPI
app = FastAPI(
    title="HealthPulse Analytics API",
    description="API Gateway for HealthPulse Analytics Platform",
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

# Add Prometheus metrics
app.add_middleware(PrometheusMiddleware)
app.add_route("/metrics", handle_metrics)
Instrumentator().instrument(app).expose(app)

# Pydantic models
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

class UserCreate(UserBase):
    password: str
    email: str

class User(UserBase):
    id: str
    email: str

class Patient(BaseModel):
    patient_id: str
    mrn: str
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    department: Optional[str] = None
    room: Optional[str] = None
    admission_date: Optional[str] = None
    attending_physician: Optional[str] = None
    
class PatientDetail(Patient):
    diagnoses: List[str] = []
    comorbidities: List[str] = []
    risk_scores: Optional[Dict[str, float]] = None
    vitals: Optional[Dict[str, Any]] = None
    labs: List[Dict[str, Any]] = []
    medications: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []

class RiskPrediction(BaseModel):
    patient_id: str
    risk_type: str
    score: float
    timestamp: str

class RiskExplanation(BaseModel):
    patient_id: str
    risk_type: str
    score: float
    global_importance: List[Dict[str, Any]]
    patient_specific: List[Dict[str, Any]]
    recommendation: Optional[str] = None

class Alert(BaseModel):
    id: int
    patient_id: str
    timestamp: str
    risk_type: str
    risk_score: float
    priority: str
    message: str
    recommended_action: Optional[str] = None
    status: str

class AlertUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str

# Database connection
db_engine = create_engine(POSTGRES_URI)

# Authentication functions
def verify_password(plain_password, hashed_password):
    """Verify password against hashed version"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate password hash"""
    return pwd_context.hash(password)

def get_user(username: str):
    """Get user from database"""
    try:
        with db_engine.connect() as conn:
            query = text("""
                SELECT id, username, password_hash, name, role, department, email
                FROM users
                WHERE username = :username
            """)
            result = conn.execute(query, {"username": username})
            user = result.mappings().first()
            
            if user:
                return dict(user)
            return None
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_user: {str(e)}")
        return None

def authenticate_user(username: str, password: str):
    """Authenticate user with username and password"""
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user["password_hash"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
        
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
        
    return User(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        role=user["role"],
        department=user.get("department"),
        email=user["email"]
    )

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get current active user"""
    # In a real system, check if user is active
    return current_user

# Role-based access control
def check_admin_role(current_user: User = Depends(get_current_active_user)):
    """Check if user has admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user

# API routes
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    # Check database connection
    db_healthy = True
    try:
        with db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db_healthy = False
    
    # Check ML model server
    ml_healthy = True
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ML_MODEL_SERVER_URL}/health", timeout=5.0)
            ml_healthy = response.status_code == 200
    except httpx.RequestError:
        ml_healthy = False
    
    is_healthy = db_healthy and ml_healthy
    
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": "healthy" if db_healthy else "unhealthy",
            "ml_model_server": "healthy" if ml_healthy else "unhealthy"
        }
    }

@app.post("/api/v1/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and issue JWT token"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    try:
        with db_engine.connect() as conn:
            query = text("""
                UPDATE users
                SET last_login = NOW()
                WHERE username = :username
            """)
            conn.execute(query, {"username": user["username"]})
            conn.commit()
    except SQLAlchemyError as e:
        logger.error(f"Error updating last login: {str(e)}")
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user

@app.get("/api/v1/users", response_model=List[User])
async def get_users(
    current_user: User = Depends(check_admin_role),
    skip: int = 0,
    limit: int = 100
):
    """Get all users (admin only)"""
    try:
        with db_engine.connect() as conn:
            query = text("""
                SELECT id, username, name, role, department, email
                FROM users
                ORDER BY name
                OFFSET :skip LIMIT :limit
            """)
            result = conn.execute(query, {"skip": skip, "limit": limit})
            users = [dict(row) for row in result.mappings()]
            
            return [
                User(
                    id=user["id"],
                    username=user["username"],
                    name=user["name"],
                    role=user["role"],
                    department=user.get("department"),
                    email=user["email"]
                ) for user in users
            ]
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.post("/api/v1/users", response_model=User)
async def create_user(
    user: UserCreate,
    current_user: User = Depends(check_admin_role)
):
    """Create new user (admin only)"""
    # Check if username already exists
    existing_user = get_user(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    try:
        with db_engine.connect() as conn:
            # Hash password
            hashed_password = get_password_hash(user.password)
            
            # Insert user
            query = text("""
                INSERT INTO users (username, password_hash, name, role, department, email)
                VALUES (:username, :password_hash, :name, :role, :department, :email)
                RETURNING id
            """)
            
            result = conn.execute(query, {
                "username": user.username,
                "password_hash": hashed_password,
                "name": user.name,
                "role": user.role,
                "department": user.department,
                "email": user.email
            })
            
            user_id = result.scalar()
            conn.commit()
            
            # Return created user (without password)
            return User(
                id=str(user_id),
                username=user.username,
                name=user.name,
                role=user.role,
                department=user.department,
                email=user.email
            )
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in create_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.get("/api/v1/patients", response_model=List[Patient])
async def get_patients(
    current_user: User = Depends(get_current_active_user),
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get list of patients with optional filtering"""
    try:
        with db_engine.connect() as conn:
            params = {"skip": skip, "limit": limit}
            
            # Build query with filters
            query_str = """
                SELECT patient_id, mrn, name, gender, age, department, room,
                       admission_date, attending_physician
                FROM patients
                WHERE 1=1
            """
            
            # Department filter
            if department:
                query_str += " AND department = :department"
                params["department"] = department
            
            # Search filter (name or MRN)
            if search:
                query_str += " AND (name ILIKE :search OR mrn ILIKE :search)"
                params["search"] = f"%{search}%"
            
            # Add clinician filter based on role and department
            if current_user.role == "clinician" and current_user.department:
                query_str += " AND department = :user_department"
                params["user_department"] = current_user.department
            
            # Add ordering, offset, and limit
            query_str += " ORDER BY name OFFSET :skip LIMIT :limit"
            
            query = text(query_str)
            result = conn.execute(query, params)
            
            patients = []
            for row in result.mappings():
                patient = dict(row)
                
                # Convert datetime objects to string for JSON serialization
                if patient.get("admission_date"):
                    patient["admission_date"] = patient["admission_date"].isoformat()
                    
                patients.append(Patient(**patient))
                
            return patients
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.get("/api/v1/patients/{patient_id}", response_model=PatientDetail)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed patient information"""
    try:
        with db_engine.connect() as conn:
            # Get patient base info
            query = text("""
                SELECT patient_id, mrn, name, gender, age, department, room,
                       admission_date, attending_physician
                FROM patients
                WHERE patient_id = :patient_id
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            patient_row = result.mappings().first()
            
            if not patient_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Patient {patient_id} not found"
                )
            
            patient = dict(patient_row)
            
            # Format dates for JSON
            if patient.get("admission_date"):
                patient["admission_date"] = patient["admission_date"].isoformat()
            
            # Get diagnoses
            query = text("""
                SELECT diagnosis FROM diagnoses
                WHERE patient_id = :patient_id
                ORDER BY diagnosis
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            diagnoses = [row[0] for row in result]
            
            # Get comorbidities
            query = text("""
                SELECT condition FROM comorbidities
                WHERE patient_id = :patient_id
                ORDER BY condition
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            comorbidities = [row[0] for row in result]
            
            # Get latest risk scores
            query = text("""
                SELECT deterioration_risk, readmission_risk, sepsis_risk, timestamp
                FROM risk_scores
                WHERE patient_id = :patient_id
                ORDER BY timestamp DESC
                LIMIT 1
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            risk_row = result.mappings().first()
            
            risk_scores = None
            if risk_row:
                risk_scores = {
                    "deterioration": float(risk_row["deterioration_risk"]),
                    "readmission": float(risk_row["readmission_risk"]),
                    "sepsis": float(risk_row["sepsis_risk"]),
                    "timestamp": risk_row["timestamp"].isoformat()
                }
            
            # Get latest vitals
            query = text("""
                SELECT heart_rate, systolic_bp, diastolic_bp, temperature,
                       respiration_rate, o2_saturation, pain_level, timestamp
                FROM vitals
                WHERE patient_id = :patient_id
                ORDER BY timestamp DESC
                LIMIT 1
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            vitals_row = result.mappings().first()
            
            vitals = None
            if vitals_row:
                vitals_dict = dict(vitals_row)
                vitals_dict["timestamp"] = vitals_dict["timestamp"].isoformat()
                vitals = vitals_dict
            
            # Get latest lab results
            query = text("""
                SELECT DISTINCT ON (test_name) test_name, value, unit, timestamp, is_abnormal
                FROM lab_results
                WHERE patient_id = :patient_id
                ORDER BY test_name, timestamp DESC
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            labs = []
            for row in result.mappings():
                lab = dict(row)
                lab["timestamp"] = lab["timestamp"].isoformat()
                labs.append(lab)
            
            # Get current medications
            query = text("""
                SELECT name, dosage, frequency, route, start_date
                FROM medications
                WHERE patient_id = :patient_id AND (end_date IS NULL OR end_date > NOW())
                ORDER BY name
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            medications = []
            for row in result.mappings():
                med = dict(row)
                med["start_date"] = med["start_date"].isoformat()
                medications.append(med)
            
            # Get active alerts
            query = text("""
                SELECT id, timestamp, risk_type, risk_score, priority, message, recommended_action, status
                FROM alerts
                WHERE patient_id = :patient_id AND status = 'active'
                ORDER BY timestamp DESC
            """)
            
            result = conn.execute(query, {"patient_id": patient_id})
            alerts = []
            for row in result.mappings():
                alert = dict(row)
                alert["timestamp"] = alert["timestamp"].isoformat()
                alerts.append(alert)
            
            # Log audit record for PHI access
            query = text("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
                VALUES (:user_id, 'view', 'patient', :patient_id, :details)
            """)
            
            conn.execute(query, {
                "user_id": current_user.id,
                "patient_id": patient_id,
                "details": {"access_type": "detail_view"}
            })
            conn.commit()
            
            # Combine all data
            return PatientDetail(
                **patient,
                diagnoses=diagnoses,
                comorbidities=comorbidities,
                risk_scores=risk_scores,
                vitals=vitals,
                labs=labs,
                medications=medications,
                alerts=alerts
            )
            
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.get("/api/v1/high-risk", response_model=List[Patient])
async def get_high_risk_patients(
    current_user: User = Depends(get_current_active_user),
    department: Optional[str] = None
):
    """Get list of high-risk patients"""
    try:
        with db_engine.connect() as conn:
            params = {}
            
            # Build query with filters
            query_str = """
                SELECT patient_id, mrn, name, gender, age, department, room,
                       admission_date, attending_physician,
                       deterioration_risk, readmission_risk, sepsis_risk, alert_level
                FROM high_risk_patients
                WHERE 1=1
            """
            
            # Department filter
            if department:
                query_str += " AND department = :department"
                params["department"] = department
            
            # Add clinician filter based on role and department
            if current_user.role == "clinician" and current_user.department:
                query_str += " AND department = :user_department"
                params["user_department"] = current_user.department
            
            # Add ordering
            query_str += " ORDER BY GREATEST(deterioration_risk, readmission_risk, sepsis_risk) DESC"
            
            query = text(query_str)
            result = conn.execute(query, params)
            
            patients = []
            for row in result.mappings():
                patient = dict(row)
                
                # Convert datetime objects to string for JSON serialization
                if patient.get("admission_date"):
                    patient["admission_date"] = patient["admission_date"].isoformat()
                    
                # Add risk scores
                risk_scores = {
                    "deterioration": float(patient.pop("deterioration_risk")),
                    "readmission": float(patient.pop("readmission_risk")),
                    "sepsis": float(patient.pop("sepsis_risk")),
                    "alert_level": patient.pop("alert_level")
                }
                
                patient_obj = Patient(**patient)
                patient_obj.risk_scores = risk_scores
                patients.append(patient_obj)
                
            return patients
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_high_risk_patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.get("/api/v1/predict/{risk_type}/{patient_id}", response_model=RiskPrediction)
async def predict_risk(
    risk_type: str,
    patient_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Predict risk score for a patient"""
    if risk_type not in ['deterioration', 'readmission', 'sepsis']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid risk type: {risk_type}"
        )
    
    try:
        # Call ML model server
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ML_MODEL_SERVER_URL}/predict/{risk_type}",
                params={"patient_id": patient_id},
                headers={"Authorization": f"Bearer {get_token_for_internal_calls()}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from ML service: {response.text}"
                )
            
            prediction = response.json()
            return prediction
            
    except httpx.RequestError as e:
        logger.error(f"Error calling ML service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service unavailable"
        )

@app.get("/api/v1/explain/{risk_type}/{patient_id}", response_model=RiskExplanation)
async def explain_risk(
    risk_type: str,
    patient_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get explanation for risk prediction"""
    if risk_type not in ['deterioration', 'readmission', 'sepsis']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid risk type: {risk_type}"
        )
    
    try:
        # Call ML model server
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ML_MODEL_SERVER_URL}/explain/{risk_type}",
                json={"patient_id": patient_id},
                headers={"Authorization": f"Bearer {get_token_for_internal_calls()}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from ML service: {response.text}"
                )
            
            explanation = response.json()
            return explanation
            
    except httpx.RequestError as e:
        logger.error(f"Error calling ML service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service unavailable"
        )

@app.get("/api/v1/alerts", response_model=List[Alert])
async def get_alerts(
    current_user: User = Depends(get_current_active_user),
    patient_id: Optional[str] = None,
    status: str = "active",
    skip: int = 0,
    limit: int = 50
):
    """Get alerts with optional filtering"""
    try:
        with db_engine.connect() as conn:
            params = {"skip": skip, "limit": limit, "status": status}
            
            # Build query with filters
            query_str = """
                SELECT a.id, a.patient_id, a.timestamp, a.risk_type, a.risk_score,
                       a.priority, a.message, a.recommended_action, a.status,
                       p.name as patient_name, p.department
                FROM alerts a
                JOIN patients p ON a.patient_id = p.patient_id
                WHERE a.status = :status
            """
            
            # Patient filter
            if patient_id:
                query_str += " AND a.patient_id = :patient_id"
                params["patient_id"] = patient_id
            
            # Add clinician filter based on role and department
            if current_user.role == "clinician" and current_user.department:
                query_str += " AND p.department = :department"
                params["department"] = current_user.department
            
            # Add ordering, offset, and limit
            query_str += """
                ORDER BY 
                    CASE 
                        WHEN a.priority = 'high' THEN 1
                        WHEN a.priority = 'medium' THEN 2
                        ELSE 3
                    END,
                    a.timestamp DESC
                OFFSET :skip LIMIT :limit
            """
            
            query = text(query_str)
            result = conn.execute(query, params)
            
            alerts = []
            for row in result.mappings():
                alert = dict(row)
                
                # Convert timestamp to string
                alert["timestamp"] = alert["timestamp"].isoformat()
                
                # Remove extra fields from join
                alert.pop("patient_name", None)
                alert.pop("department", None)
                
                alerts.append(Alert(**alert))
                
            return alerts
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_alerts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.put("/api/v1/alerts/{alert_id}", response_model=Alert)
async def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update alert status (acknowledge or dismiss)"""
    try:
        with db_engine.connect() as conn:
            # Check if alert exists
            query = text("""
                SELECT id, patient_id, timestamp, risk_type, risk_score,
                       priority, message, recommended_action, status
                FROM alerts
                WHERE id = :alert_id
            """)
            
            result = conn.execute(query, {"alert_id": alert_id})
            alert_row = result.mappings().first()
            
            if not alert_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Alert {alert_id} not found"
                )
            
            # Update alert status
            query = text("""
                UPDATE alerts
                SET status = :status,
                    acknowledged_by = :user_id,
                    acknowledged_at = NOW(),
                    notes = :notes,
                    updated_at = NOW()
                WHERE id = :alert_id
                RETURNING id, patient_id, timestamp, risk_type, risk_score,
                          priority, message, recommended_action, status
            """)
            
            result = conn.execute(query, {
                "alert_id": alert_id,
                "status": alert_update.status,
                "user_id": current_user.id,
                "notes": alert_update.notes
            })
            
            updated_alert = dict(result.mappings().first())
            conn.commit()
            
            # Convert timestamp to string
            updated_alert["timestamp"] = updated_alert["timestamp"].isoformat()
            
            # Log audit record
            query = text("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
                VALUES (:user_id, 'update', 'alert', :alert_id, :details)
            """)
            
            conn.execute(query, {
                "user_id": current_user.id,
                "alert_id": str(alert_id),
                "details": {"status": alert_update.status}
            })
            conn.commit()
            
            return Alert(**updated_alert)
            
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in update_alert: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

@app.get("/api/v1/audit-logs", response_model=List[Dict[str, Any]])
async def get_audit_logs(
    current_user: User = Depends(check_admin_role),
    user_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get audit logs with filtering (admin only)"""
    try:
        with db_engine.connect() as conn:
            params = {"skip": skip, "limit": limit}
            
            # Build query with filters
            query_str = """
                SELECT al.id, al.user_id, u.username, u.name as user_name,
                       al.action, al.entity_type, al.entity_id, al.details,
                       al.ip_address, al.timestamp
                FROM audit_logs al
                JOIN users u ON al.user_id = u.id
                WHERE 1=1
            """
            
            # User filter
            if user_id:
                query_str += " AND al.user_id = :user_id"
                params["user_id"] = user_id
            
            # Entity type filter
            if entity_type:
                query_str += " AND al.entity_type = :entity_type"
                params["entity_type"] = entity_type
            
            # Entity id filter
            if entity_id:
                query_str += " AND al.entity_id = :entity_id"
                params["entity_id"] = entity_id
            
            # Date range filters
            if start_date:
                query_str += " AND al.timestamp >= :start_date"
                params["start_date"] = start_date
            
            if end_date:
                query_str += " AND al.timestamp <= :end_date"
                params["end_date"] = end_date
            
            # Add ordering, offset, and limit
            query_str += " ORDER BY al.timestamp DESC OFFSET :skip LIMIT :limit"
            
            query = text(query_str)
            result = conn.execute(query, params)
            
            logs = []
            for row in result.mappings():
                log = dict(row)
                
                # Convert timestamp to string
                log["timestamp"] = log["timestamp"].isoformat()
                
                logs.append(log)
                
            return logs
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_audit_logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )

# System settings routes
@app.get("/api/v1/settings/alert-thresholds")
async def get_alert_thresholds(
    current_user: User = Depends(get_current_active_user)
):
    """Get alert threshold settings"""
    try:
        # Call ML model server
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ML_MODEL_SERVER_URL}/settings/alert-thresholds",
                headers={"Authorization": f"Bearer {get_token_for_internal_calls()}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from ML service: {response.text}"
                )
            
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"Error calling ML service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service unavailable"
        )

@app.patch("/api/v1/settings/alert-thresholds")
async def update_alert_thresholds(
    thresholds: Dict[str, Dict[str, float]],
    current_user: User = Depends(check_admin_role)
):
    """Update alert threshold settings (admin only)"""
    try:
        # Call ML model server
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{ML_MODEL_SERVER_URL}/settings/alert-thresholds",
                json={"thresholds": thresholds},
                headers={"Authorization": f"Bearer {get_token_for_internal_calls()}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from ML service: {response.text}"
                )
            
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"Error calling ML service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service unavailable"
        )

# Utility functions
def get_token_for_internal_calls() -> str:
    """Generate a token for internal service-to-service calls"""
    # In a real system, we would use a service account
    # For simplicity, we're creating a token for an admin user
    admin_data = {"sub": "system", "role": "admin"}
    return create_access_token(admin_data)

# Add middleware for request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Error handler for SQLAlchemy errors
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle SQLAlchemy errors"""
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred"}
    )

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
