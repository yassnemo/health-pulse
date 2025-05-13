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
('P-002', 'Jane', 'Smith', '1972-08-24', 'Female', '456 Oak Ave, Somewhere', '555-234-5678', 'jane.smith@example.com', 'A-', 'Neurology', '2025-04-30', 'Admitted', 'Dr. Johnson'),
('P-003', 'Robert', 'Brown', '1958-11-03', 'Male', '789 Pine Rd, Elsewhere', '555-345-6789', 'robert.brown@example.com', 'B+', 'Oncology', '2025-05-01', 'Critical', 'Dr. Williams'),
('P-004', 'Sarah', 'Williams', '1980-02-15', 'Female', '101 Elm St, Nowhere', '555-456-7890', 'sarah.williams@example.com', 'AB+', 'Cardiology', '2025-05-03', 'Stable', 'Dr. Smith'),
('P-005', 'Michael', 'Taylor', '1975-06-21', 'Male', '202 Cedar Ln, Anyplace', '555-567-8901', 'michael.taylor@example.com', 'O-', 'General', '2025-05-05', 'Admitted', 'Dr. Johnson');

-- Insert sample vitals
INSERT INTO vitals (patient_id, timestamp, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, temperature, oxygen_saturation)
VALUES
('P-001', NOW() - INTERVAL '1 hour', 72, 120, 80, 14, 36.8, 98),
('P-001', NOW() - INTERVAL '2 hours', 74, 122, 82, 15, 36.9, 97),
('P-001', NOW() - INTERVAL '3 hours', 76, 125, 85, 16, 37.0, 96),
('P-002', NOW() - INTERVAL '1 hour', 68, 130, 85, 13, 36.5, 99),
('P-002', NOW() - INTERVAL '2 hours', 70, 132, 87, 14, 36.6, 98),
('P-003', NOW() - INTERVAL '1 hour', 88, 145, 95, 18, 38.2, 92),
('P-003', NOW() - INTERVAL '2 hours', 90, 150, 100, 20, 38.5, 90),
('P-004', NOW() - INTERVAL '1 hour', 65, 118, 75, 12, 36.6, 99),
('P-005', NOW() - INTERVAL '1 hour', 70, 125, 80, 13, 36.7, 98);

-- Insert sample alerts
INSERT INTO alerts (patient_id, timestamp, alert_type, severity, status, message, acknowledged_by, acknowledged_at)
VALUES
('P-001', NOW() - INTERVAL '45 minutes', 'Vitals', 'Medium', 'Active', 'Heart rate elevated above threshold', NULL, NULL),
('P-002', NOW() - INTERVAL '2 hours', 'Medication', 'Low', 'Acknowledged', 'Medication schedule reminder', 'doctor', NOW() - INTERVAL '1 hour'),
('P-003', NOW() - INTERVAL '30 minutes', 'Critical', 'High', 'Active', 'Multiple vitals outside normal ranges', NULL, NULL),
('P-003', NOW() - INTERVAL '15 minutes', 'System', 'High', 'Active', 'Predicted risk of deterioration is high', NULL, NULL),
('P-004', NOW() - INTERVAL '3 hours', 'Lab', 'Medium', 'Resolved', 'Abnormal lab results detected', 'nurse', NOW() - INTERVAL '2 hours');

-- Insert sample risk scores (could be in a separate table in your schema)
CREATE TABLE IF NOT EXISTS risk_scores (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    timestamp TIMESTAMP DEFAULT NOW(),
    risk_type VARCHAR(50),
    score FLOAT
);

INSERT INTO risk_scores (patient_id, risk_type, score)
VALUES
('P-001', 'cardiac', 0.35),
('P-001', 'readmission', 0.25),
('P-002', 'cardiac', 0.15),
('P-002', 'readmission', 0.45),
('P-003', 'cardiac', 0.75),
('P-003', 'readmission', 0.65),
('P-003', 'sepsis', 0.80),
('P-004', 'cardiac', 0.20),
('P-004', 'readmission', 0.10),
('P-005', 'cardiac', 0.40),
('P-005', 'readmission', 0.30);

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, timestamp, action, resource_type, resource_id, details)
VALUES
('admin', NOW() - INTERVAL '2 days', 'VIEW', 'PATIENT', 'P-001', 'Viewed patient details'),
('doctor', NOW() - INTERVAL '1 day', 'UPDATE', 'PATIENT', 'P-003', 'Updated treatment plan'),
('doctor', NOW() - INTERVAL '12 hours', 'ACKNOWLEDGE', 'ALERT', '2', 'Acknowledged medication alert'),
('nurse', NOW() - INTERVAL '6 hours', 'VIEW', 'VITALS', 'P-002', 'Checked patient vitals'),
('admin', NOW() - INTERVAL '3 hours', 'SYSTEM', 'USER', 'nurse', 'Reset user password');

-- Success message
SELECT 'Sample data loaded successfully!' as message;
