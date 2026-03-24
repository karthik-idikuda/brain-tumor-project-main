import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# ─── Import Routes ───────────────────────────────────────────────
from app.routes import upload, trends, analytics
from app.utils.database import init_db

app = FastAPI(
    title="BrainScan AI — Brain Tumor Detection Platform",
    description="Backend API and React Frontend Server",
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
    print("[App] ✅ FastAPI Backend and React Frontend started. Open http://127.0.0.1:8000")

# ─── API Routers ─────────────────────────────────────────────────
app.include_router(upload.router)
app.include_router(trends.router)
app.include_router(analytics.router)

# ─── React SPA Serving ───────────────────────────────────────────
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Fallback for React Router (Single Page App). Serves index.html on 404s."""
    index = os.path.join(FRONTEND_DIST, "index.html")
    # If the requested path does not start with a known API prefix, serve the React app
    if not request.url.path.startswith(("/upload", "/trends", "/analytics", "/docs", "/openapi.json")):
        if os.path.exists(index):
            return FileResponse(index)
    return JSONResponse(status_code=404, content={"detail": "Not found"})

# Mount the static React files
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"status": "error", "message": "React build missing in frontend/dist/"}