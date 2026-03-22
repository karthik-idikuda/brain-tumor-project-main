# 🧠 Brain Tumor Detection System

A machine learning-powered web application for detecting and classifying brain tumors from MRI scans using deep learning.

## 📋 Features

- **MRI Image Upload & Analysis**: Upload brain MRI scans for automated tumor detection
- **Deep Learning Classification**: Powered by TensorFlow/Keras for accurate predictions
- **RESTful API**: FastAPI-based backend for seamless integration
- **Analytics Dashboard**: Track predictions and trends over time
- **Real-time Processing**: Fast and efficient image processing pipeline

## 🚀 Technologies Used

- **Backend**: FastAPI
- **Machine Learning**: TensorFlow, Keras
- **Image Processing**: Pillow
- **Database**: PostgreSQL (optional)
- **Environment Management**: Python dotenv

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Praveen23-kk/brain-tumor-project.git
cd brain-tumor-project
```

2. **Create a virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create a `.env` file in the root directory with your configuration.

5. **Run the application**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

6. **Run the frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## 📖 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🔍 Usage

1. Open the React app at `http://localhost:5173`
2. On Home, enable location consent (optional) and upload MRI images
3. Receive AI prediction + confidence result
4. Explore global trend mining and analytics dashboards
5. Use FastAPI docs at `/docs` for API-level testing

## 🧩 Implemented Modules

1. **Upload Module**
	- MRI upload UI and backend file validation

2. **AI Classification Module**
	- TensorFlow/Keras model inference using `Brain_Tumor_Model.h5`

3. **Web Mining Module**
	- NewsAPI integration for current brain tumor related articles
	- WHO GLOBOCAN-style global incidence/mortality dataset endpoint

4. **Web Analytics Module**
	- Anonymized interaction logging (page views and uploads)
	- Optional geolocation tracking based on user consent

5. **Dashboard Module**
	- Charts for results, countries, and trend timelines
	- Leaflet heatmap for geospatial activity points

## 📁 Project Structure

```
brain-tumor-project/
├── app/
│   ├── main.py           # FastAPI application entry point
│   ├── routes/           # API route handlers
│   ├── models/           # ML models
│   └── utils/            # Utility functions
├── data/                 # Data storage
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not tracked)
└── README.md            # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**K Praveen Kumar**
- GitHub: [@Praveen23-kk](https://github.com/Praveen23-kk)

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Always consult with qualified medical professionals for medical diagnoses.

## 🔐 Environment Variables

Create `.env` in project root:

```env
NEWS_API_KEY=your_newsapi_key_here
```


## Architecture Overview

### Project Type
- **Primary stack:** Python application
- **Primary language:** Python
- **Primary entrypoint/build root:** main module or app script

### High-Level Architecture
- This repository is organized in modular directories grouped by concern (application code, configuration, scripts, documentation, and assets).
- Runtime/build artifacts such as virtual environments, node modules, and compiled outputs are intentionally excluded from architecture mapping.
- The project follows a layered flow: entry point -> domain/application modules -> integrations/data/config.

### Component Breakdown
- **Application layer:** Core executables, services, UI, or command handlers.
- **Domain/business layer:** Feature logic and processing modules.
- **Integration layer:** External APIs, databases, files, or platform-specific connectors.
- **Support layer:** Config, scripts, docs, tests, and static assets.

### Data/Execution Flow
1. Start from the configured entrypoint or package scripts.
2. Route execution into feature-specific modules.
3. Process domain logic and interact with integrations/storage.
4. Return results to UI/API/CLI outputs.

### Directory Map (Top-Level + Key Subfolders)
```
.tmp_pdf_extract.txt
.DS_Store
app
app/.DS_Store
app/requirements.txt
app/___init__.py
app/utils
app/models
app/__pycache__
app/main.py
app/routes
frontend
frontend/index.html
frontend/dist
frontend/node_modules
frontend/vite.config.js
frontend/README.md
frontend/public
frontend/.gitignore
frontend/package-lock.json
frontend/package.json
frontend/eslint.config.js
frontend/src
requirements.txt
brain_tumor.db
README.md
test.webp
.gitignore
.env
.venv
AI-Powered Brain Tumor Detection Platform with Global Trend Mining and Geospatial User Analytics.pdf
venv
venv2
```

### Notes
- Architecture section auto-generated on 2026-03-22 and can be refined further with exact runtime/deployment details.
