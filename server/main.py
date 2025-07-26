from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze, ask
import os
from dotenv import load_dotenv
import logging
from pathlib import Path
from app.utils.transcript import load_whisper_model_on_startup  # Whisper loader

# Load environment variables
load_dotenv()

# Setup logs directory (Hugging Face Spaces needs writable paths)
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

# Create FastAPI app
app = FastAPI()

# Allow local + deployed frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ytbuddy1-1.onrender.com",
        "https://ayushman18-ytbuddy.hf.space"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Warn if Gemini API key missing
if not os.getenv('GEMINI_API_KEY'):
    logger.warning("GEMINI_API_KEY not found. Some features may not work.")

# Load Whisper model when the server starts
@app.on_event("startup")
async def startup_event():
    print("=== STARTING YTBUDDY SERVER ===")
    print(f"Gemini Key Loaded: {bool(os.getenv('GEMINI_API_KEY'))}")
    load_whisper_model_on_startup()

# Register API routes
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ask.router, prefix="/api", tags=["ask"])

# Log every request (for debugging)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    try:
        if request.method == "POST":
            body = await request.body()
            logger.debug(f"Request body: {body.decode()}")
    except Exception as e:
        logger.warning(f"Could not log request body: {e}")
    return await call_next(request)

@app.get("/")
async def root():
    return {"message": "YTBuddy API is running! Use /api/analyze or /api/ask."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/debug/packages")
async def debug_packages():
    import yt_dlp
    import whisper
    return {
        "yt_dlp": {"version": yt_dlp.version.__version__},
        "whisper": {"attributes": dir(whisper)},
    }
