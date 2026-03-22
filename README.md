# Brain Tumor Detection Platform

An AI-powered brain tumor detection system with global trend mining and geospatial user analytics. The platform combines a FastAPI backend running a TensorFlow/Keras deep learning model with a React-based frontend, enabling users to upload brain MRI scans and receive real-time classification results.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Overview

This platform provides:

- **Deep learning inference** for brain tumor classification from MRI images
- **FastAPI REST API** for image upload and prediction serving
- **React frontend** with drag-and-drop MRI upload and visualization
- **Global trend mining** via NewsAPI integration for brain tumor research news
- **Geospatial analytics** tracking user interaction patterns
- **SQLite database** for storing scan records and analytics data

---

## Architecture

```
+---------------------------+
|     React Frontend        |
|  (Vite + React Router)    |
|  - MRI Upload Interface   |
|  - Prediction Display     |
|  - News Feed Dashboard    |
+---------------------------+
            |
            v  HTTP/REST
+---------------------------+
|     FastAPI Backend        |
|  - /predict endpoint      |
|  - /news endpoint         |
|  - Jinja2 templates       |
+---------------------------+
        |           |
        v           v
+-------------+ +------------------+
| TensorFlow  | | SQLite Database  |
| Keras Model | | (brain_tumor.db) |
| (inference) | | - Scan records   |
+-------------+ | - User analytics |
                +------------------+
```

---

## Technology Stack

| Component        | Technology                              |
|------------------|-----------------------------------------|
| Backend          | FastAPI, Uvicorn                        |
| ML Framework     | TensorFlow, Keras                       |
| Image Processing | Pillow                                  |
| Frontend         | React (Vite)                            |
| Database         | SQLite (via psycopg2 for PostgreSQL option) |
| News Integration | NewsAPI Python client                   |
| Templating       | Jinja2                                  |
| File Handling    | python-multipart                        |
| Environment      | python-dotenv                           |

---

## Project Structure

```
brain-tumor-project-main/
|
|-- requirements.txt              # Python dependencies
|-- brain_tumor.db                # SQLite database
|
|-- app/
|   |-- main.py                   # FastAPI application entry point
|   |-- models/                   # TensorFlow model files
|   |-- routes/                   # API route handlers
|   +-- utils/                    # Utility functions
|
+-- frontend/
    |-- package.json              # Node.js dependencies
    |-- vite.config.js            # Vite build configuration
    |-- index.html                # HTML entry point
    +-- src/                      # React components and pages
```

---

## Installation

### Backend

```bash
cd brain-tumor-project-main

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add NewsAPI key and other configuration
```

### Frontend

```bash
cd frontend
npm install
```

---

## Usage

### Start Backend

```bash
cd app
uvicorn main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## API Endpoints

| Endpoint    | Method | Description                           |
|-------------|--------|---------------------------------------|
| `/predict`  | POST   | Upload MRI image for classification   |
| `/news`     | GET    | Fetch brain tumor research news       |
| `/`         | GET    | Serve web interface                   |

---

## License

This project is released for educational and research purposes.
