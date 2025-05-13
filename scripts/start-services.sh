#!/bin/bash
# Start HealthPulse Analytics Services

# Change to the docker directory
cd "$(dirname "$0")/../infrastructure/docker"

echo "Starting HealthPulse Analytics services..."
echo "This may take a few minutes for the first run as images need to be built."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start the services in detached mode
docker-compose up -d

echo "Services are starting..."
echo "- Frontend will be available at: http://localhost:3000"
echo "- API Gateway will be available at: http://localhost:8080"
echo "- Grafana dashboard will be available at: http://localhost:3001 (admin/healthpulse)"
echo ""
echo "Use 'docker-compose logs -f' to view service logs"
echo "Use 'docker-compose down' to stop services"
