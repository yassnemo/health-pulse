FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -U pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Run the API Gateway
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
