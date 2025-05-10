# API Documentation for HealthPulse Analytics

This documentation outlines the available API endpoints for the HealthPulse Analytics platform.

## Base URL

- Development: `http://localhost:8080/api/v1`
- Production: `https://api.healthpulse.yourdomain.com/api/v1`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Login

```
POST /auth/login
```

Request body:
```json
{
  "username": "clinician@hospital.org",
  "password": "your_password"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user_info": {
    "id": "user-id",
    "username": "clinician@hospital.org",
    "role": "clinician",
    "name": "Dr. Jane Smith",
    "department": "Cardiology"
  }
}
```

#### Refresh Token

```
POST /auth/refresh
```

Request header:
```
Authorization: Bearer <your_refresh_token>
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## Patient Data

### Get Patient List

```
GET /patients
```

Query parameters:
- `department` - Filter by department
- `risk_level` - Filter by risk level (high, medium, low)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

Response:
```json
{
  "total": 120,
  "page": 1,
  "limit": 20,
  "patients": [
    {
      "id": "patient-123",
      "mrn": "MRN12345",
      "name": "John Doe",
      "age": 65,
      "gender": "male",
      "department": "Cardiology",
      "admission_date": "2023-04-15T10:30:00Z",
      "risk_scores": {
        "readmission": 0.82,
        "deterioration": 0.45,
        "sepsis": 0.12
      },
      "alert_level": "high"
    },
    ...
  ]
}
```

### Get Patient Details

```
GET /patients/{patient_id}
```

Response:
```json
{
  "id": "patient-123",
  "mrn": "MRN12345",
  "name": "John Doe",
  "age": 65,
  "gender": "male",
  "department": "Cardiology",
  "room": "4B-123",
  "admission_date": "2023-04-15T10:30:00Z",
  "diagnosis": ["Congestive Heart Failure", "Hypertension", "Type 2 Diabetes"],
  "risk_scores": {
    "readmission": 0.82,
    "deterioration": 0.45,
    "sepsis": 0.12
  },
  "alert_level": "high",
  "attending_physician": "Dr. Sarah Johnson",
  "vitals": {
    "latest": {
      "heart_rate": 88,
      "blood_pressure": "145/92",
      "temperature": 37.1,
      "respiration_rate": 18,
      "o2_saturation": 94,
      "timestamp": "2023-04-18T15:30:00Z"
    }
  }
}
```

### Get Patient Vitals History

```
GET /patients/{patient_id}/vitals
```

Query parameters:
- `start_time` - ISO timestamp (default: 24 hours ago)
- `end_time` - ISO timestamp (default: now)
- `resolution` - Data point resolution (default: 5m)

Response:
```json
{
  "patient_id": "patient-123",
  "start_time": "2023-04-17T15:30:00Z",
  "end_time": "2023-04-18T15:30:00Z",
  "resolution": "5m",
  "vitals": {
    "heart_rate": [
      {"timestamp": "2023-04-17T15:30:00Z", "value": 72},
      {"timestamp": "2023-04-17T15:35:00Z", "value": 74},
      ...
    ],
    "blood_pressure": [
      {"timestamp": "2023-04-17T15:30:00Z", "value": "120/80"},
      {"timestamp": "2023-04-17T15:35:00Z", "value": "122/82"},
      ...
    ],
    ...
  }
}
```

## Risk Predictions

### Get Patient Risk History

```
GET /patients/{patient_id}/risks
```

Query parameters:
- `risk_type` - Type of risk (readmission, deterioration, sepsis)
- `start_time` - ISO timestamp (default: 7 days ago)
- `end_time` - ISO timestamp (default: now)

Response:
```json
{
  "patient_id": "patient-123",
  "risk_type": "deterioration",
  "predictions": [
    {
      "timestamp": "2023-04-11T10:00:00Z",
      "score": 0.23,
      "contributing_factors": [
        {"factor": "heart_rate", "importance": 0.35},
        {"factor": "respiration", "importance": 0.28},
        ...
      ]
    },
    ...
  ]
}
```

### Get Risk Explanation

```
GET /patients/{patient_id}/risks/{risk_type}/explain
```

Response:
```json
{
  "patient_id": "patient-123",
  "risk_type": "deterioration",
  "score": 0.45,
  "timestamp": "2023-04-18T15:30:00Z",
  "global_importance": [
    {"feature": "heart_rate", "importance": 0.35},
    {"feature": "respiration_rate", "importance": 0.28},
    {"feature": "o2_saturation", "importance": 0.22},
    ...
  ],
  "patient_specific": [
    {"feature": "heart_rate", "value": 88, "normal_range": "60-80", "contribution": 0.15},
    {"feature": "respiration_rate", "value": 18, "normal_range": "12-20", "contribution": 0.05},
    {"feature": "medication_change", "value": true, "contribution": 0.12},
    ...
  ],
  "similar_cases": 15,
  "recommendation": "Consider monitoring fluid intake and adjusting medication."
}
```

## Alerts

### Get Active Alerts

```
GET /alerts
```

Query parameters:
- `department` - Filter by department
- `priority` - Filter by priority (high, medium, low)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

Response:
```json
{
  "total": 8,
  "page": 1,
  "limit": 20,
  "alerts": [
    {
      "id": "alert-456",
      "patient_id": "patient-123",
      "patient_name": "John Doe",
      "department": "Cardiology",
      "room": "4B-123",
      "risk_type": "deterioration",
      "risk_score": 0.82,
      "priority": "high",
      "timestamp": "2023-04-18T14:35:00Z",
      "status": "active",
      "message": "Significant increase in deterioration risk",
      "recommended_action": "Immediate clinical review recommended"
    },
    ...
  ]
}
```

### Update Alert Status

```
PATCH /alerts/{alert_id}
```

Request body:
```json
{
  "status": "acknowledged",
  "notes": "Patient reviewed, adjusting medication"
}
```

Response:
```json
{
  "id": "alert-456",
  "patient_id": "patient-123",
  "status": "acknowledged",
  "updated_at": "2023-04-18T15:45:00Z",
  "updated_by": "Dr. Jane Smith",
  "notes": "Patient reviewed, adjusting medication"
}
```

## Settings

### Get Alert Thresholds

```
GET /settings/alert-thresholds
```

Response:
```json
{
  "thresholds": {
    "deterioration": {
      "high": 0.7,
      "medium": 0.4
    },
    "readmission": {
      "high": 0.8,
      "medium": 0.5
    },
    "sepsis": {
      "high": 0.6,
      "medium": 0.3
    }
  }
}
```

### Update Alert Thresholds

```
PATCH /settings/alert-thresholds
```

Request body:
```json
{
  "thresholds": {
    "deterioration": {
      "high": 0.75
    }
  }
}
```

Response:
```json
{
  "updated": true,
  "thresholds": {
    "deterioration": {
      "high": 0.75,
      "medium": 0.4
    },
    "readmission": {
      "high": 0.8,
      "medium": 0.5
    },
    "sepsis": {
      "high": 0.6,
      "medium": 0.3
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": "JWT token is expired"
  }
}
```

Common error codes:
- `BAD_REQUEST` (400): Invalid parameters
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `INTERNAL_ERROR` (500): Server error
