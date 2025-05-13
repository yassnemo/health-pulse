#!/bin/bash
# Initia# Copy sample data SQL script into container
echo "Copying sample data..."
docker cp ./updated_sample_data.sql postgres:/tmp/

# Execute the SQL script
echo "Importing sample data..."
docker exec postgres psql -U healthpulse -d healthpulse -f /tmp/updated_sample_data.sqltabase with sample data for testing

# Change to the database directory
cd "$(dirname "$0")/../backend/data_storage"

echo "Setting up database with sample data..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if postgres container is running
if ! docker ps | grep -q postgres; then
  echo "Postgres container is not running. Please start services first with scripts/start-services.sh"
  exit 1
fi

# Copy sample data SQL script into container
echo "Copying sample data..."
docker cp $(pwd)/sample_data.sql postgres:/tmp/

# Execute the SQL script
echo "Importing sample data..."
docker exec postgres bash -c "psql -U healthpulse -d healthpulse -f /tmp/sample_data.sql"

echo "Sample data imported successfully!"
echo "You can now access the application with pre-populated data."
