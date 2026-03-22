import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─── Import Routes ───────────────────────────────────────────────
from app.routes import upload, trends, analytics
from app.utils.database import init_db

app = FastAPI(
    title="BrainScan AI — Brain Tumor Detection Platform API",
    description="Backend API for the React Frontend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DB Init ─────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    init_db()
    print("[App] ✅ FastAPI Backend started.")

# ─── API Routers ─────────────────────────────────────────────────
app.include_router(upload.router)
app.include_router(trends.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "BrainScan AI Backend is Running"}