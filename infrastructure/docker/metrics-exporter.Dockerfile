FROM node:16-alpine

WORKDIR /app

# Install bc for calculations in the shell script
RUN apk add --no-cache bc bash

# Copy the metrics generator script and the exporter
COPY scripts/generate-sample-metrics.sh /app/
COPY scripts/metrics-exporter.js /app/

# Install Node.js dependencies
RUN npm init -y && npm install express

# Make the script executable
RUN chmod +x /app/generate-sample-metrics.sh

# Start script that will run both the metrics generator and the exporter
COPY scripts/start-metrics.sh /app/
RUN chmod +x /app/start-metrics.sh

EXPOSE 8888

CMD ["/app/start-metrics.sh"]
