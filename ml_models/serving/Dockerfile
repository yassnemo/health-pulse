FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -U pip && \
    pip install -r requirements.txt

# Create directories for models
RUN mkdir -p /app/models/deterioration \
    /app/models/readmission \
    /app/models/sepsis

# Copy application code
COPY . .

# Run the model server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
