# HealthPulse Analytics: Workflow and Data Flow Diagrams

This document provides visual diagrams to illustrate the architecture, data flow, and user interaction patterns within the HealthPulse Analytics platform. These diagrams are rendered using Mermaid.js.

## 1. High-Level System Architecture

This diagram shows the major components of HealthPulse Analytics and how they connect. It provides an overview of the microservices, data stores, and monitoring infrastructure.

```mermaid
graph TD
    User[<img src='https://via.placeholder.com/30/f9f/000?text=User' style='vertical-align: middle; border-radius: 50%;'/> Clinician/User] -->|Interacts via Browser| FE(Frontend Dashboard - React);

    subgraph "Application Services (Dockerized)"
        FE -->|HTTP/S API Calls| APIGW(API Gateway - FastAPI);
        APIGW -->|Requests Predictions & Data| MLS(ML Model Server - FastAPI);
        APIGW -->|Data Queries| DB_PG[(PostgreSQL - Patient Records)];
        APIGW -->|Data Queries| DB_IF[(InfluxDB - Time-Series Vitals)];

        MLS -->|Accesses Models/Data| DB_PG;
        MLS -->|Accesses Models/Data| DB_IF;

        DP(Data Processing Service - Python);
        KAFKA[Apache Kafka - Data Stream];

        DG(Data Generator - Python Script) -->|Streams Raw Data| KAFKA;
        KAFKA -->|Raw Data| DP;
        DP -->|Stores Processed Data| DB_PG;
        DP -->|Stores Processed Data| DB_IF;
    end

    subgraph "Monitoring Infrastructure (Dockerized)"
        PROM[Prometheus];
        GRAF[Grafana];
        ME(Metrics Exporter);

        APIGW -->|Exposes Metrics| PROM;
        MLS -->|Exposes Metrics| PROM;
        DP -->|Exposes Metrics| PROM;
        KAFKA -- Exposes Metrics --> PROM;
        DB_PG -- Exposes Metrics --> PROM;
        DB_IF -- Exposes Metrics --> PROM;
        ME -->|Exposes Custom Metrics| PROM;
        PROM -->|Serves Metrics| GRAF;
        User -->|Views Monitoring Dashboards| GRAF;
    end

    style User fill:#f9f,stroke:#333,stroke-width:2px
    style FE fill:#ccf,stroke:#333,stroke-width:2px
    style APIGW fill:#9cf,stroke:#333,stroke-width:2px
    style MLS fill:#9cf,stroke:#333,stroke-width:2px
    style DP fill:#9cf,stroke:#333,stroke-width:2px
    style KAFKA fill:#fcc,stroke:#333,stroke-width:2px
    style DG fill:#fcc,stroke:#333,stroke-width:2px
    style DB_PG fill:#cfc,stroke:#333,stroke-width:2px
    style DB_IF fill:#cfc,stroke:#333,stroke-width:2px
    style PROM fill:#ff9,stroke:#333,stroke-width:2px
    style GRAF fill:#ff9,stroke:#333,stroke-width:2px
    style ME fill:#ff9,stroke:#333,stroke-width:2px
```

## 2. Data Flow for Patient Risk Prediction

This sequence diagram illustrates the journey of patient data from its source (or simulation) through processing and analysis, ultimately resulting in risk predictions displayed on the clinician's dashboard.

```mermaid
sequenceDiagram
    participant User as Clinician
    participant FE as Frontend Dashboard
    participant APIGW as API Gateway
    participant MLS as ML Model Server
    participant PG as PostgreSQL
    participant IFX as InfluxDB
    participant DP as Data Processing
    participant KAFKA as Kafka
    participant DG as Data Generator

    %% User requests data
    User->>FE: 1. Opens Patient View (e.g., for Patient X)
    FE->>APIGW: 2. Request Patient Data (ID: X)

    %% API Gateway fetches data
    APIGW->>PG: 3a. Query Demographics (ID: X)
    PG-->>APIGW: 3b. Demographic Data
    APIGW->>IFX: 4a. Query Vitals (ID: X)
    IFX-->>APIGW: 4b. Vitals Data
    APIGW->>MLS: 5a. Request Risk Score (Data for ID: X)
    MLS-->>APIGW: 5b. Calculated Risk Score

    %% Data displayed to user
    APIGW-->>FE: 6. Aggregated Patient Data & Risk Score
    FE->>User: 7. Display Patient Details & Risk

    %% Background Data Ingestion & Processing (Continuous)
    Note right of DG: Data Ingestion Pipeline
    DG->>KAFKA: A. Stream Raw Patient Vitals/Events
    KAFKA->>DP: B. Forward Raw Data Stream
    DP->>DP: C. Clean, Transform, Validate Data
    DP->>PG: D. Store Structured Data (Demographics, History)
    DP->>IFX: E. Store Time-Series Vitals

    Note right of MLS: Model Training (Typically Offline/Periodic)
    MLS-)PG: Access Historical Data for Training
    MLS-)IFX: Access Historical Vitals for Training
```

## 3. User Interaction Flow (Clinician with Dashboard)

This flowchart outlines a typical interaction sequence for a clinician using the HealthPulse dashboard, from login to viewing patient details.

```mermaid
graph LR
    Start((Start)) --> A[Clinician Opens Browser];
    A --> B("Navigates to HealthPulse URL: <br> e.g., http://localhost:8082");
    B --> C{Login Page};
    C --> D["Enters Credentials <br> (e.g., nurse/password)"];
    D --> E{"Backend Authentication <br> (via API Gateway)"};
    E -- Valid Credentials --> F["Main Dashboard Displayed <br> (Patient List / Overview)"];
    E -- Invalid Credentials --> C;

    F --> G{User Action: Selects a Patient};
    G --> H[Patient Detail View Loaded];
    H --> I["Displays: <br> - Demographics (from PostgreSQL) <br> - Vital Signs Charts (from InfluxDB) <br> - Risk Scores (from ML Model Server)"];
    I --> J{"User Action: Interacts with Charts/Data <br> or Navigates Back"};
    J -- View Other Patients --> F;
    J -- Log Out --> K[User Action: Logs Out];

    F --> K_alt{"User Action: Uses Search/Filter"};
    K_alt --> F;

    K --> End((End Session));

    style Start fill:#ddd,stroke:#333,stroke-width:2px
    style End fill:#ddd,stroke:#333,stroke-width:2px
    style A fill:#f9f,stroke:#333,stroke-width:1px
    style C fill:#ffcc99,stroke:#333,stroke-width:1px
    style F fill:#ccf,stroke:#333,stroke-width:1px
    style H fill:#ccf,stroke:#333,stroke-width:1px
```

These diagrams provide a simplified visual representation of the HealthPulse Analytics system. For more detailed architectural information, please refer to the main [README.md](../README.md) and other documents in the `/docs` folder.
