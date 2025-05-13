#!/bin/bash

# Script to generate sample metrics for demonstration purposes

# Ensure the directory exists
mkdir -p /tmp/metrics_export

# Generate sample patient metrics with more realistic variations and patient conditions
generate_patient_metrics() {
  local timestamp=$(date +%s)
  local patient_id=$1
  
  # Patient condition simulation (0=healthy, 1=moderate risk, 2=high risk)
  # Each patient maintains their condition with small random variations
  if [ -z "${patient_conditions[$patient_id]}" ]; then
    # First time seeing this patient, assign a condition
    # 60% healthy, 30% moderate risk, 10% high risk
    local condition_roll=$(( $RANDOM % 100 ))
    if [ $condition_roll -lt 60 ]; then
      patient_conditions[$patient_id]=0
    elif [ $condition_roll -lt 90 ]; then
      patient_conditions[$patient_id]=1
    else
      patient_conditions[$patient_id]=2
    fi
  fi
  
  # Small chance of condition changing
  local change_chance=$(( $RANDOM % 100 ))
  if [ $change_chance -lt 5 ]; then
    # 5% chance of condition changing
    if [ ${patient_conditions[$patient_id]} -eq 0 ]; then
      # Healthy patient might get worse
      patient_conditions[$patient_id]=1
    elif [ ${patient_conditions[$patient_id]} -eq 1 ]; then
      # Moderate risk patient might get better or worse
      if [ $change_chance -lt 2 ]; then
        patient_conditions[$patient_id]=2
      else
        patient_conditions[$patient_id]=0
      fi
    else
      # High risk patient might get better
      patient_conditions[$patient_id]=1
    fi
  fi
  
  local condition=${patient_conditions[$patient_id]}
  
  # Generate vitals based on patient condition
  local risk_score
  local heart_rate
  local blood_pressure_systolic
  local blood_pressure_diastolic
  local temperature
  local spo2
  
  case $condition in
    0) # Healthy
      risk_score=$(echo "scale=2; ($RANDOM % 30) / 100" | bc)
      heart_rate=$(( 60 + $RANDOM % 20 ))
      blood_pressure_systolic=$(( 110 + $RANDOM % 20 ))
      blood_pressure_diastolic=$(( 70 + $RANDOM % 10 ))
      temperature=$(echo "scale=1; 36.5 + ($RANDOM % 10) / 10" | bc)
      spo2=$(( 97 + $RANDOM % 4 ))
      ;;
    1) # Moderate risk
      risk_score=$(echo "scale=2; 0.3 + ($RANDOM % 30) / 100" | bc)
      heart_rate=$(( 80 + $RANDOM % 30 ))
      blood_pressure_systolic=$(( 130 + $RANDOM % 30 ))
      blood_pressure_diastolic=$(( 80 + $RANDOM % 15 ))
      temperature=$(echo "scale=1; 37.0 + ($RANDOM % 15) / 10" | bc)
      spo2=$(( 92 + $RANDOM % 6 ))
      ;;
    2) # High risk
      risk_score=$(echo "scale=2; 0.6 + ($RANDOM % 40) / 100" | bc)
      heart_rate=$(( 100 + $RANDOM % 40 ))
      blood_pressure_systolic=$(( 150 + $RANDOM % 40 ))
      blood_pressure_diastolic=$(( 95 + $RANDOM % 20 ))
      temperature=$(echo "scale=1; 37.5 + ($RANDOM % 20) / 10" | bc)
      spo2=$(( 85 + $RANDOM % 10 ))
      ;;
  esac
  
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

# Initialize patient conditions array to track patient state over time
declare -A patient_conditions

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
