from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze, ask
import os
from dotenv import load_dotenv
import logging
from pathlib import Path
from app.utils.transcript import load_whisper_model_on_startup  # Import the function

load_dotenv()

# Use a writable directory for logs (Hugging Face allows /tmp)
log_dir = Path("/tmp/logs")
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'server.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ytbuddy-frontend.onrender.com"  # Your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verify environment variables
if not os.getenv('GEMINI_API_KEY'):
    print("Warning: GEMINI_API_KEY not found. Some features may not work.")


# Load Whisper model at startup
@app.on_event("startup")
async def startup_event():
    print("=== STARTING SERVER ===")
    print(f"Gemini Key Loaded: {bool(os.getenv('GEMINI_API_KEY'))}")
    load_whisper_model_on_startup()

# Include routes
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ask.router, prefix="/api", tags=["ask"])

# Log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")
    try:
        if request.method == "POST":
            body = await request.body()
            logger.debug(f"Request body: {body.decode()}")
    except Exception as e:
        logger.warning(f"Could not log request body: {str(e)}")
    response = await call_next(request)
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/debug/packages")
async def debug_packages():
    import pytube
    import whisper
    return {
        "pytube": {"version": pytube.__version__, "attributes": dir(pytube)},
        "whisper": {"version": whisper.__version__, "attributes": dir(whisper)},
    }
