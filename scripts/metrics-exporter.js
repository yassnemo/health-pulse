const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8888;

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', (req, res) => {
  try {
    const metricsFile = '/tmp/metrics_export/sample_metrics.txt';
    
    // Check if the file exists (in case the generate script hasn't run yet)
    if (fs.existsSync(metricsFile)) {
      const metrics = fs.readFileSync(metricsFile, 'utf8');
      res.type('text/plain').send(metrics);
    } else {
      // Generate some basic metrics if file doesn't exist
      const timestamp = Math.floor(Date.now() / 1000);
      let basicMetrics = `# HELP patient_count The total number of patients\n`;
      basicMetrics += `# TYPE patient_count gauge\n`;
      basicMetrics += `patient_count ${Math.floor(Math.random() * 100)} ${timestamp}\n`;
      res.type('text/plain').send(basicMetrics);
    }
  } catch (error) {
    console.error('Error serving metrics:', error);
    res.status(500).send('Error serving metrics');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Sample metrics exporter listening on port ${PORT}`);
});
