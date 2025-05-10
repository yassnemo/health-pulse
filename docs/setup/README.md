# HealthPulse Analytics Setup Guide

This document provides detailed instructions for setting up the HealthPulse Analytics platform in various environments.

## Local Development Setup

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/healthpulse.git
cd healthpulse
```

### Step 2: Environment Configuration

Create `.env` files in the appropriate directories:

#### Backend API Gateway

```bash
cd backend/api_gateway
cp .env.example .env
# Edit .env with your preferred settings
```

#### ML Model Server

```bash
cd ../../ml_models/serving
cp .env.example .env
# Edit .env with your preferred settings
```

#### Frontend

```bash
cd ../../frontend
cp .env.example .env
# Edit .env with your preferred settings
```

### Step 3: Start the Development Environment

```bash
cd ../../infrastructure/docker
docker-compose up
```

This will start all the necessary services:
- Zookeeper and Kafka for data streaming
- PostgreSQL and InfluxDB for data storage
- Data processing services
- ML model server
- API Gateway
- Frontend development server
- Prometheus and Grafana for monitoring

### Step 4: Accessing the Services

- Frontend Dashboard: http://localhost:3000
- API Documentation: http://localhost:8080/docs
- ML Model Server Documentation: http://localhost:8000/docs
- Grafana Dashboards: http://localhost:3001 (admin/healthpulse)
- Prometheus: http://localhost:9090

## Production Deployment

### Cloud Prerequisites

- Kubernetes cluster (GKE, AKS, or EKS)
- Container Registry access
- DNS configuration for your domain
- TLS certificates

### Step 1: Configure Kubernetes Resources

1. Update Kubernetes configuration files in `infrastructure/k8s/`
2. Set up secrets:

```bash
kubectl create namespace healthpulse

# Create database secrets
kubectl create secret generic db-credentials \
  --from-literal=postgres-password=your-secure-password \
  --from-literal=influxdb-token=your-secure-token \
  -n healthpulse

# Create JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=jwt-secret=your-secure-jwt-secret \
  -n healthpulse

# Add TLS certificates
kubectl create secret tls healthpulse-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n healthpulse
```

### Step 2: Deploy to Kubernetes

```bash
# Apply all configuration files
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/storage-class.yaml
kubectl apply -f infrastructure/k8s/persistent-volumes.yaml
kubectl apply -f infrastructure/k8s/data-layer/
kubectl apply -f infrastructure/k8s/processing-layer/
kubectl apply -f infrastructure/k8s/ml-layer/
kubectl apply -f infrastructure/k8s/api-gateway/
kubectl apply -f infrastructure/k8s/frontend/
kubectl apply -f infrastructure/k8s/monitoring/
kubectl apply -f infrastructure/k8s/ingress.yaml
```

### Step 3: Verify Deployment

```bash
kubectl get pods -n healthpulse
kubectl get services -n healthpulse
kubectl get ingress -n healthpulse
```

## Demo Mode Setup

The system includes a demo mode for showcasing functionality with synthetic data.

### Starting Demo Mode

```bash
# From project root
cd backend/data_ingestion
python start_demo.py
```

This script will:
1. Generate synthetic patient data
2. Stream it through Kafka
3. Process and store it in databases
4. Generate simulated alerts and risk scores

Demo mode automatically accelerates time to show progression of patient conditions over a compressed timeframe.

## Troubleshooting

### Common Issues

#### Services Not Starting

Check Docker Compose logs:
```bash
docker-compose logs <service-name>
```

#### Database Connection Issues

Ensure PostgreSQL and InfluxDB are running:
```bash
docker-compose ps postgres influxdb
```

#### Kafka Topics Missing

List and create Kafka topics if needed:
```bash
docker-compose exec kafka kafka-topics --list --bootstrap-server kafka:29092
docker-compose exec kafka kafka-topics --create --topic patient-data --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
```

#### ML Models Not Loading

Check ML model server logs:
```bash
docker-compose logs ml-model-server
```

Ensure model files exist in the correct location.

## System Verification

After setup, verify system functionality by:

1. Accessing the frontend dashboard
2. Checking for data flow in Grafana
3. Testing API endpoints using the Swagger documentation
4. Reviewing logs for each component

For additional support, please contact the HealthPulse Analytics team.
