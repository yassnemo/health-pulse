-- HealthPulse Analytics Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    mrn VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    age INTEGER,
    department VARCHAR(100),
    room VARCHAR(50),
    admission_date TIMESTAMP WITH TIME ZONE,
    attending_physician VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on department for filtering
CREATE INDEX IF NOT EXISTS idx_patients_department ON patients(department);

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    diagnosis VARCHAR(255) NOT NULL,
    diagnosis_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, diagnosis)
);

-- Comorbidities table
CREATE TABLE IF NOT EXISTS comorbidities (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    condition VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, condition)
);

-- Risk scores table
CREATE TABLE IF NOT EXISTS risk_scores (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deterioration_risk NUMERIC(4,2) NOT NULL,
    readmission_risk NUMERIC(4,2) NOT NULL,
    sepsis_risk NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_id and timestamp for faster lookups
CREATE INDEX IF NOT EXISTS idx_risk_scores_patient_time ON risk_scores(patient_id, timestamp);

-- Vitals table
CREATE TABLE IF NOT EXISTS vitals (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    heart_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    temperature NUMERIC(3,1),
    respiration_rate INTEGER,
    o2_saturation INTEGER,
    pain_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_id and timestamp
CREATE INDEX IF NOT EXISTS idx_vitals_patient_time ON vitals(patient_id, timestamp);
-- Create partial index for abnormal values to quickly identify issues
CREATE INDEX IF NOT EXISTS idx_vitals_abnormal_hr ON vitals(patient_id, timestamp) 
    WHERE heart_rate > 100 OR heart_rate < 50;

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50),
    normal_min NUMERIC(10,2),
    normal_max NUMERIC(10,2),
    is_abnormal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_id and timestamp
CREATE INDEX IF NOT EXISTS idx_labs_patient_time ON lab_results(patient_id, timestamp);
-- Create index on test name
CREATE INDEX IF NOT EXISTS idx_labs_test_name ON lab_results(test_name);
-- Create partial index for abnormal values
CREATE INDEX IF NOT EXISTS idx_labs_abnormal ON lab_results(patient_id, timestamp)
    WHERE is_abnormal = TRUE;

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_id
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
-- Create index on active medications
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(patient_id) 
    WHERE end_date IS NULL;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    risk_type VARCHAR(50) NOT NULL,
    risk_score NUMERIC(4,2) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    message TEXT,
    recommended_action TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_id and timestamp
CREATE INDEX IF NOT EXISTS idx_alerts_patient_time ON alerts(patient_id, timestamp);
-- Create index on active alerts
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(status)
    WHERE status = 'active';

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert notifications table
CREATE TABLE IF NOT EXISTS alert_notifications (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id),
    user_id UUID REFERENCES users(id),
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    delivery_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent'
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- System settings table (global settings)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value)
VALUES 
    ('alert_thresholds', '{"deterioration": {"high": 0.7, "medium": 0.4}, "readmission": {"high": 0.8, "medium": 0.5}, "sepsis": {"high": 0.6, "medium": 0.3}}'),
    ('system_version', '"1.0.0"')
ON CONFLICT (setting_key) DO NOTHING;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on entity type and id
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create view for high risk patients
CREATE OR REPLACE VIEW high_risk_patients AS
SELECT 
    p.patient_id,
    p.mrn,
    p.name,
    p.age,
    p.gender,
    p.department,
    p.room,
    p.admission_date,
    p.attending_physician,
    rs.deterioration_risk,
    rs.readmission_risk,
    rs.sepsis_risk,
    CASE 
        WHEN rs.deterioration_risk >= 0.7 OR rs.readmission_risk >= 0.8 OR rs.sepsis_risk >= 0.6 THEN 'high'
        WHEN rs.deterioration_risk >= 0.4 OR rs.readmission_risk >= 0.5 OR rs.sepsis_risk >= 0.3 THEN 'medium'
        ELSE 'low'
    END AS alert_level
FROM 
    patients p
JOIN 
    (SELECT 
         patient_id, 
         MAX(timestamp) as latest_time
     FROM 
         risk_scores
     GROUP BY 
         patient_id) latest 
ON 
    p.patient_id = latest.patient_id
JOIN 
    risk_scores rs 
ON 
    rs.patient_id = latest.patient_id AND rs.timestamp = latest.latest_time
WHERE 
    rs.deterioration_risk >= 0.7 OR rs.readmission_risk >= 0.8 OR rs.sepsis_risk >= 0.6;

-- Create demo user for development
INSERT INTO users (
    username, 
    password_hash, -- hashed version of "healthpulse123"
    name, 
    role, 
    email
) VALUES (
    'demouser',
    '$2a$12$T3h2vaNFnFIF/ukwOdnNxuq6WKBr50YZWdfeK5YMG9tzXRzy9tIzC',
    'Demo User',
    'clinician',
    'demo@healthpulse.example'
) ON CONFLICT (username) DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_patients_modtime
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_medications_modtime
BEFORE UPDATE ON medications
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_alerts_modtime
BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_settings_modtime
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_system_settings_modtime
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
