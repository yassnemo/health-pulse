-- HealthPulse Analytics Sample Data
-- This script populates the database with sample data for development and testing

-- Clear existing data (if any)
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE vitals CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE audit_logs CASCADE;

-- Insert sample users
INSERT INTO users (username, email, password_hash, name, role, department, created_at) 
VALUES 
('admin', 'admin@healthpulse.com', '$2b$12$HlLt5OSRI4ZraXPtWpBCKetPmRGBS3OhX91.CufLkAYRGQOhc5gda', 'Admin User', 'admin', 'Administration', NOW()),
('doctor', 'doctor@healthpulse.com', '$2b$12$HlLt5OSRI4ZraXPtWpBCKetPmRGBS3OhX91.CufLkAYRGQOhc5gda', 'Doctor Smith', 'doctor', 'Cardiology', NOW()),
('nurse', 'nurse@healthpulse.com', '$2b$12$HlLt5OSRI4ZraXPtWpBCKetPmRGBS3OhX91.CufLkAYRGQOhc5gda', 'Nurse Johnson', 'nurse', 'General', NOW());

-- Insert sample patients
INSERT INTO patients (patient_id, mrn, name, gender, age, department, room, admission_date, attending_physician)
VALUES
('P-001', 'MRN-001', 'John Doe', 'Male', 60, 'Cardiology', '101A', '2025-04-28', 'Dr. Smith'),
('P-002', 'MRN-002', 'Jane Smith', 'Female', 53, 'Neurology', '202B', '2025-04-30', 'Dr. Johnson'),
('P-003', 'MRN-003', 'Robert Brown', 'Male', 67, 'Oncology', '303C', '2025-05-01', 'Dr. Williams'),
('P-004', 'MRN-004', 'Sarah Williams', 'Female', 45, 'Cardiology', '104A', '2025-05-03', 'Dr. Smith'),
('P-005', 'MRN-005', 'Michael Taylor', 'Male', 50, 'General', '205B', '2025-05-05', 'Dr. Johnson');

-- Insert sample vitals
INSERT INTO vitals (patient_id, timestamp, heart_rate, systolic_bp, diastolic_bp, respiration_rate, temperature, o2_saturation, pain_level)
VALUES
('P-001', NOW() - INTERVAL '1 hour', 72, 120, 80, 14, 36.8, 98, 2),
('P-001', NOW() - INTERVAL '2 hours', 74, 122, 82, 15, 36.9, 97, 3),
('P-001', NOW() - INTERVAL '3 hours', 76, 125, 85, 16, 37.0, 96, 2),
('P-002', NOW() - INTERVAL '1 hour', 68, 130, 85, 13, 36.5, 99, 1),
('P-002', NOW() - INTERVAL '2 hours', 70, 132, 87, 14, 36.6, 98, 2),
('P-003', NOW() - INTERVAL '1 hour', 88, 145, 95, 18, 38.2, 92, 5),
('P-003', NOW() - INTERVAL '2 hours', 90, 150, 100, 20, 38.5, 90, 6),
('P-004', NOW() - INTERVAL '1 hour', 65, 118, 75, 12, 36.6, 99, 0),
('P-005', NOW() - INTERVAL '1 hour', 70, 125, 80, 13, 36.7, 98, 1);

-- Insert sample alerts
INSERT INTO alerts (patient_id, timestamp, risk_type, risk_score, priority, message, recommended_action, status)
VALUES
('P-001', NOW() - INTERVAL '45 minutes', 'deterioration', 0.65, 'medium', 'Heart rate elevated above threshold', 'Monitor vitals every 30 mins', 'active'),
('P-002', NOW() - INTERVAL '2 hours', 'readmission', 0.45, 'low', 'Medication schedule reminder', 'Check medication compliance', 'acknowledged'),
('P-003', NOW() - INTERVAL '30 minutes', 'sepsis', 0.85, 'high', 'Multiple vitals outside normal ranges', 'Order immediate blood culture', 'active'),
('P-003', NOW() - INTERVAL '15 minutes', 'deterioration', 0.75, 'high', 'Predicted risk of deterioration is high', 'Consider ICU transfer', 'active'),
('P-004', NOW() - INTERVAL '3 hours', 'readmission', 0.30, 'medium', 'Abnormal lab results detected', 'Review lab results', 'resolved');

-- Insert risk scores
INSERT INTO risk_scores (patient_id, deterioration_risk, readmission_risk, sepsis_risk)
VALUES
('P-001', 0.35, 0.25, 0.15),
('P-002', 0.15, 0.45, 0.10),
('P-003', 0.75, 0.65, 0.80),
('P-004', 0.20, 0.10, 0.05),
('P-005', 0.40, 0.30, 0.25);

-- Insert audit logs
-- First, get the UUIDs for our users
DO $$
DECLARE
    admin_id uuid;
    doctor_id uuid;
    nurse_id uuid;
BEGIN
    SELECT id INTO admin_id FROM users WHERE username = 'admin';
    SELECT id INTO doctor_id FROM users WHERE username = 'doctor';
    SELECT id INTO nurse_id FROM users WHERE username = 'nurse';
    
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, timestamp)
    VALUES
    (admin_id, 'VIEW', 'PATIENT', 'P-001', '{"action": "viewed", "details": "Patient profile access"}', NOW() - INTERVAL '2 days'),
    (doctor_id, 'UPDATE', 'PATIENT', 'P-003', '{"action": "updated", "field": "treatment_plan"}', NOW() - INTERVAL '1 day'),
    (doctor_id, 'ACKNOWLEDGE', 'ALERT', '2', '{"action": "acknowledged", "alert_type": "medication"}', NOW() - INTERVAL '12 hours'),
    (nurse_id, 'VIEW', 'VITALS', 'P-002', '{"action": "checked", "vital_type": "all"}', NOW() - INTERVAL '6 hours'),
    (admin_id, 'SYSTEM', 'USER', 'nurse', '{"action": "reset", "target": "password"}', NOW() - INTERVAL '3 hours');
END $$;

-- Success message
SELECT 'Sample data loaded successfully!' as message;
