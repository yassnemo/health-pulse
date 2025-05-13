#!/bin/bash

# Script to generate sample metrics for demonstration purposes

# Ensure the directory exists
mkdir -p /tmp/metrics_export

# Generate sample patient metrics
generate_patient_metrics() {
  local timestamp=$(date +%s)
  local patient_id=$1
  local risk_score=$(echo "scale=2; $RANDOM % 100 / 100" | bc)
  local heart_rate=$(( 60 + $RANDOM % 40 ))
  local blood_pressure_systolic=$(( 110 + $RANDOM % 40 ))
  local blood_pressure_diastolic=$(( 70 + $RANDOM % 20 ))
  local temperature=$(echo "scale=1; 36.5 + $RANDOM % 20 / 10" | bc)
  local spo2=$(( 94 + $RANDOM % 7 ))
  
  echo "patient_risk_score{patient_id=\"$patient_id\"} $risk_score $timestamp"
  echo "patient_vital_heart_rate{patient_id=\"$patient_id\"} $heart_rate $timestamp"
  echo "patient_vital_blood_pressure_systolic{patient_id=\"$patient_id\"} $blood_pressure_systolic $timestamp"
  echo "patient_vital_blood_pressure_diastolic{patient_id=\"$patient_id\"} $blood_pressure_diastolic $timestamp"
  echo "patient_vital_temperature{patient_id=\"$patient_id\"} $temperature $timestamp"
  echo "patient_vital_spo2{patient_id=\"$patient_id\"} $spo2 $timestamp"
}

# Generate hospital metrics
generate_hospital_metrics() {
  local timestamp=$(date +%s)
  local beds_available=$(( 20 + $RANDOM % 30 ))
  local beds_occupied=$(( 50 + $RANDOM % 50 ))
  local admission_rate=$(echo "scale=2; $RANDOM % 100 / 100" | bc)
  local readmission_rate=$(echo "scale=2; $RANDOM % 30 / 100" | bc)
  
  echo "hospital_beds_available $beds_available $timestamp"
  echo "hospital_beds_occupied $beds_occupied $timestamp"
  echo "hospital_admission_rate $admission_rate $timestamp"
  echo "hospital_readmission_rate $readmission_rate $timestamp"
}

# Generate alert metrics
generate_alert_metrics() {
  local timestamp=$(date +%s)
  local high_priority_alerts=$(( $RANDOM % 10 ))
  local medium_priority_alerts=$(( $RANDOM % 20 ))
  local low_priority_alerts=$(( $RANDOM % 30 ))
  
  echo "alerts_high_priority $high_priority_alerts $timestamp"
  echo "alerts_medium_priority $medium_priority_alerts $timestamp"
  echo "alerts_low_priority $low_priority_alerts $timestamp"
}

# Generate system metrics
generate_system_metrics() {
  local timestamp=$(date +%s)
  local cpu_usage=$(echo "scale=2; $RANDOM % 100 / 100" | bc)
  local memory_usage=$(echo "scale=2; $RANDOM % 100 / 100" | bc)
  local api_requests=$(( $RANDOM % 1000 ))
  local api_errors=$(( $RANDOM % 50 ))
  
  echo "system_cpu_usage $cpu_usage $timestamp"
  echo "system_memory_usage $memory_usage $timestamp"
  echo "system_api_requests $api_requests $timestamp"
  echo "system_api_errors $api_errors $timestamp"
}

# Generate sample data for multiple patients
echo "Generating sample metrics data..."

# Output file
OUTPUT_FILE="/tmp/metrics_export/sample_metrics.txt"
rm -f $OUTPUT_FILE
touch $OUTPUT_FILE

# Generate data every 5 seconds for demonstration
for i in {1..100}; do
  echo "# HELP patient metrics for healthcare monitoring" >> $OUTPUT_FILE
  echo "# TYPE patient_risk_score gauge" >> $OUTPUT_FILE
  for patient_id in {1001..1010}; do
    generate_patient_metrics $patient_id >> $OUTPUT_FILE
  done
  
  echo "# HELP hospital metrics for facility monitoring" >> $OUTPUT_FILE
  echo "# TYPE hospital_beds gauge" >> $OUTPUT_FILE
  generate_hospital_metrics >> $OUTPUT_FILE
  
  echo "# HELP alert metrics for tracking system alerts" >> $OUTPUT_FILE
  echo "# TYPE alerts gauge" >> $OUTPUT_FILE
  generate_alert_metrics >> $OUTPUT_FILE
  
  echo "# HELP system metrics for infrastructure monitoring" >> $OUTPUT_FILE
  echo "# TYPE system gauge" >> $OUTPUT_FILE
  generate_system_metrics >> $OUTPUT_FILE
  
  echo "Generated batch $i of sample metrics"
  sleep 1
done

echo "Sample metrics generation complete!"
echo "Output file: $OUTPUT_FILE"
