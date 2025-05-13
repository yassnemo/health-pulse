# HealthPulse Analytics

A comprehensive healthcare analytics platform using real-time predictive modeling to assess patient risks and provide actionable clinical insights.

## The Challenge in Modern Healthcare

Healthcare systems today face significant challenges in proactively managing patient health. These include:

*   **Delayed Risk Detection:** Identifying patients at high risk of adverse events (like readmissions, deterioration, or sepsis) often happens too late, limiting the window for effective intervention.
*   **Information Overload:** Clinicians are inundated with vast amounts of patient data from various sources, making it difficult to extract timely, actionable insights.
*   **Reactive Care Models:** Traditional care models are often reactive, addressing health issues only after they've become acute, leading to poorer outcomes and increased costs.
*   **Need for Data-Driven Decisions:** There's a growing need for tools that can harness the power of data and advanced analytics to support clinical decision-making and improve patient safety.

## Our Solution: HealthPulse Analytics

HealthPulse Analytics is a robust platform designed to address these challenges by leveraging real-time data streaming, machine learning, and intuitive visualizations. Our system empowers healthcare providers to:

*   **Proactively Identify At-Risk Patients:** By continuously analyzing patient data, HealthPulse predicts potential health risks before they escalate.
*   **Gain Actionable Insights:** An interactive dashboard presents complex data in an understandable format, highlighting key risk factors and trends.
*   **Enable Early Intervention:** Timely alerts and insights allow clinicians to intervene earlier, improving patient outcomes and optimizing resource allocation.
*   **Foster a Data-Driven Culture:** Provides the tools necessary for a more predictive and preventative approach to patient care.

### Key Features

*   **Real-time Risk Assessment**: Continuous monitoring and prediction of patient health risks (e.g., readmission, sepsis, deterioration).
*   **Interactive Dashboard**: Intuitive visualization of patient data, risk scores, and trends for quick clinical assessment.
*   **Clinical Decision Support**: Provides actionable insights and alerts to healthcare providers for timely interventions.
*   **Model Explainability**: Offers transparency into AI predictions with feature importance visualization, building trust and aiding interpretation.
*   **Modular Microservices Architecture**: Ensures scalability, maintainability, and resilience.
*   **Secure & Compliant**: Built with healthcare security (data encryption, RBAC) and privacy requirements in mind.

## System Architecture

HealthPulse Analytics employs a microservices architecture, ensuring modularity and scalability. Key components include:

1.  **Data Ingestion (Apache Kafka & Custom Generator):**
    *   `data-generator`: Simulates real-time patient data streams (e.g., vital signs, lab results).
    *   `kafka` & `zookeeper`: A distributed streaming platform to handle high-throughput, real-time data feeds from various sources.
2.  **Data Storage (PostgreSQL & InfluxDB):**
    *   `postgres`: Stores structured patient demographic data, historical records, and application metadata.
    *   `influxdb`: A time-series database to store real-time sensor data and patient vitals for trend analysis and monitoring.
3.  **Data Processing (Python Service):**
    *   `data-processing`: Consumes data from Kafka, performs ETL (Extract, Transform, Load) operations, validates data, and routes it to appropriate storage systems (PostgreSQL, InfluxDB).
4.  **Machine Learning Models & Serving (Python, FastAPI):**
    *   `ml-model-server`: Hosts pre-trained machine learning models. It exposes API endpoints for making predictions on patient risk based on incoming data.
5.  **API Gateway (Python, FastAPI):**
    *   `api-gateway`: Provides a unified and secure entry point for all client requests. It routes requests to the appropriate backend services (e.g., `ml-model-server`, services interacting with `postgres`).
6.  **Frontend (React):**
    *   `frontend`: A web-based, interactive dashboard that allows clinicians to view patient lists, individual patient details, risk scores, and visualizations.
7.  **Monitoring (Prometheus & Grafana):**
    *   `prometheus`: Collects metrics from various services within the HealthPulse ecosystem.
    *   `grafana`: Visualizes the metrics collected by Prometheus, providing dashboards for system health and operational monitoring.
    *   `metrics-exporter`: A custom service to generate and expose sample application-specific metrics for Prometheus to scrape.

**Data Flow:**
Patient data (simulated by `data-generator`) flows into `kafka`. The `data-processing` service consumes this data, processes it, and stores it in `postgres` (for relational data) and `influxdb` (for time-series vitals). The `ml-model-server` uses this data to make predictions, which are then exposed via the `api-gateway` to the `frontend` dashboard. System and application metrics are collected by `prometheus` and visualized in `grafana`.

## Getting Started

Follow these instructions to set up and run HealthPulse Analytics on your local machine for development and testing.

### Prerequisites

*   **Docker and Docker Compose:** Ensure Docker Desktop is installed and running. Download from [Docker's website](https://www.docker.com/products/docker-desktop/).
*   **Git:** For cloning the repository.
*   **Bash-compatible shell:** For running shell scripts (Git Bash on Windows is a good option).
*   **Node.js 16+ (Optional):** If you plan to work directly on frontend modifications outside of Docker.
*   **Python 3.9+ (Optional):** If you plan to work directly on backend service modifications outside of Docker.

### Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yassnemo/health-pulse.git
    cd health-pulse
    ```

2.  **Create Environment Files:**
    The project uses `.env` files to manage environment-specific configurations for the backend and frontend services. Example files are provided. Copy them to create your local configuration:
    ```bash
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```
    *Note: Review the created `.env` files. For local development, the defaults are often sufficient, but you might need to adjust them based on your setup or if you integrate with external services.*

3.  **Start All Services with Docker Compose:**
    The `start-services.sh` script uses Docker Compose to build the necessary Docker images (if they don't exist or if code has changed) and start all the microservices defined in `infrastructure/docker/docker-compose.yml`.
    ```bash
    bash scripts/start-services.sh
    ```
    This command will run the services in detached mode (`-d`), meaning they will run in the background.

4.  **Verify Services are Running:**
    After a few moments (initial builds can take time), check the status of all containers:
    ```bash
    docker compose -f infrastructure/docker/docker-compose.yml ps
    ```
    You should see all services listed with a status of `Up` or `running`.

5.  **Troubleshooting:**
    If a service is not running as expected (e.g., status is `Exited` or it's restarting), check its logs for errors:
    ```bash
    docker compose -f infrastructure/docker/docker-compose.yml logs <service-name>
    ```
    Replace `<service-name>` with the actual service name (e.g., `ml-model-server`, `frontend`, `api-gateway`).

6.  **Optional: Load Sample Data for Testing:**
    To populate the system with sample data for a more comprehensive testing experience:
    ```bash
    bash scripts/setup-sample-data.sh
    ```

### Default Login Credentials

For testing purposes, you can use these default credentials for the frontend application:

*   **Admin**: username: `admin`, password: `password`
*   **Doctor**: username: `doctor`, password: `password`
*   **Nurse**: username: `nurse`, password: `password`

### Access the Application

Once all services are running, you can access the different parts of the HealthPulse Analytics platform:

*   **Frontend Dashboard:** `http://localhost:8082`
    *   This is the main user interface for clinicians to view patient data, risk scores, and visualizations.
*   **API Documentation:** `http://localhost:8080/docs`
    *   Swagger/OpenAPI documentation for the `api-gateway`, showing available backend endpoints.
*   **Grafana Monitoring:** `http://localhost:3000`
    *   Access Grafana dashboards to monitor system health and application metrics.
    *   Login with username: `admin`, password: `healthpulse`.

For more detailed setup instructions, refer to the [Setup Documentation](docs/setup/README.md).

## Interacting with the Dashboard: A User's Perspective

This section outlines how a typical user, such as a nurse or clinician, would interact with the HealthPulse Analytics dashboard and how patient data is presented.

**1. Logging In:**
*   Users navigate to the Frontend Dashboard URL (e.g., `http://localhost:8082`).
*   They are greeted with a login screen where they enter their credentials (e.g., `nurse`/`password` as per the default setup).
*   The system authenticates the user and, based on their role (e.g., nurse, doctor, admin), grants access to relevant features and data views (Role-Based Access Control).

**2. Navigating and Viewing Patient Data:**
*   **Main Dashboard/Patient Lists:** Upon login, users might see an overview dashboard or a list of patients. This list typically provides a summary: patient name, perhaps a room number, and a visual indicator of their current overall risk level.
*   **Search and Filtering:** Users can search for specific patients or apply filters to narrow down the list (e.g., view only high-risk patients, patients in a particular ward, or patients with specific alerts).
*   **Detailed Patient View:** Clicking on a patient opens a comprehensive detail page, which typically includes:
    *   **Demographic Information:** Basic patient details like name, age, gender, admission date (sourced from `postgres`).
    *   **Vital Signs Monitoring:** Real-time or recent vital signs (heart rate, blood pressure, SpO2, temperature) often displayed as interactive charts showing trends over time (sourced from `influxdb`).
    *   **Calculated Risk Scores:** Prominently displayed risk predictions for conditions like sepsis, readmission, or deterioration. These scores are generated by the `ml-model-server`.
    *   **Model Explainability (if implemented):** For some risk scores, the dashboard might show the key factors contributing to the current risk assessment, enhancing transparency and trust in the AI.
    *   **Alerts and Notifications:** Any active alerts or critical changes for the patient are highlighted.

**3. Data Journey to the Dashboard (Simplified):**
The data a clinician sees on the dashboard is the result of a sophisticated backend pipeline:
*   **Data Origin:** Patient data is continuously generated (simulated by `data-generator` in this project; from EHRs/medical devices in a real setting).
*   **Ingestion & Processing:** This raw data is streamed via `kafka`, then consumed by the `data-processing` service which cleans, transforms, and stores it in `postgres` (for structured/relational data) and `influxdb` (for time-series vitals).
*   **Risk Prediction:** The `ml-model-server` accesses this processed data to run its predictive algorithms, generating risk scores.
*   **API Orchestration:** When a user interacts with the `frontend` dashboard (e.g., opens a patient's chart), the dashboard sends requests to the `api-gateway`.
*   **Data Retrieval & Display:** The `api-gateway` fetches the necessary information—demographics from `postgres`, vitals from `influxdb`, and risk scores from the `ml-model-server`—and delivers it to the `frontend`, which then renders the complete patient view for the clinician.

**4. Clinical Decision Support:**
*   Armed with this comprehensive and timely information, clinicians can make more informed decisions. For instance, a rising risk score for a specific condition can prompt earlier intervention, potentially leading to better patient outcomes.
*   Administrators might have access to additional system-level views, such as user management dashboards or audit logs.

This flow ensures that clinicians have access to up-to-date, processed, and analyzed patient data, enabling a more proactive and data-driven approach to healthcare.

## Project Impact & Conclusion

HealthPulse Analytics aims to make a significant impact by:

*   **Improving Patient Outcomes:** Early risk detection and proactive interventions can lead to better health outcomes and reduced mortality/morbidity.
*   **Enhancing Clinical Efficiency:** By providing clear, actionable insights, the platform helps clinicians make faster, more informed decisions and reduces time spent sifting through raw data.
*   **Optimizing Healthcare Resources:** Identifying high-risk patients allows for targeted resource allocation, potentially reducing hospital readmissions and overall healthcare costs.
*   **Advancing Preventative Medicine:** Shifts the focus from reactive treatment to proactive and preventative care strategies.

By integrating advanced analytics and real-time data processing into clinical workflows, HealthPulse Analytics provides a powerful tool to transform healthcare delivery, making it more predictive, personalized, and efficient.

## Documentation

Explore further documentation to understand different aspects of the project:

*   [Workflow & Data Flow Diagrams](docs/architecture/workflow-diagrams.md): Visual diagrams illustrating system architecture and data flows.
*   [API Documentation](docs/api/README.md): Detailed information about the API endpoints.
*   [Architecture Overview](docs/architecture/README.md): In-depth explanation of the system architecture.
*   [User Guides](docs/user_guides/README.md): Guides for end-users on how to use the platform.
*   [Setup Instructions](docs/setup/README.md): Comprehensive setup and deployment instructions.

## Security & Compliance

HealthPulse Analytics is designed with healthcare security and compliance in mind, including:

*   Data encryption in transit (HTTPS/TLS) and at rest.
*   Role-Based Access Control (RBAC) to ensure users only access data and features relevant to their roles.
*   Audit trails for critical system access and actions.
*   Considerations for HIPAA-compliant data handling procedures (though full compliance requires organizational policies and audits).

## License

This project is licensed under the [MIT License](LICENSE).