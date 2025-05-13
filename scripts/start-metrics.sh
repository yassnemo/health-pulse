#!/bin/bash

# Create the metrics directory if it doesn't exist
mkdir -p /tmp/metrics_export

# Start the metrics generation script in the background
echo "Starting metrics generation..."
(/app/generate-sample-metrics.sh) &

# Start the metrics exporter
echo "Starting metrics exporter..."
node /app/metrics-exporter.js
