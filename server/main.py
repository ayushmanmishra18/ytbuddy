from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze, ask
import os
from dotenv import load_dotenv
import logging
from pathlib import Path
from app.utils.transcript import load_whisper_model_on_startup  # Import as before

load_dotenv()

# Create logs directory if not exists
Path("logs").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/server.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Configuration (allow all, so Hugging Face frontend can connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replaced specific URLs with * for Hugging Face dynamic URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Warn instead of crashing if GEMINI_API_KEY is missing
if not os.getenv('GEMINI_API_KEY'):
    logger.warning("Warning: GEMINI_API_KEY is missing. API calls may fail.")

# Call the model loading function on startup
@app.on_event("startup")
async def startup_event():
    print("=== STARTING SERVER ===")
    print(f"Gemini Key Loaded: {bool(os.getenv('GEMINI_API_KEY'))}")
    try:
        load_whisper_model_on_startup()
    except Exception as e:
        logger.error(f"Whisper model failed to load: {e}")

# Include routes
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ask.router, prefix="/api", tags=["ask"])

# Log incoming requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    try:
        if request.method == "POST":
            body = await request.body()
            logger.debug(f"Request body: {body.decode(errors='ignore')}")
    except Exception as e:
        logger.warning(f"Could not log request body: {str(e)}")
    
    response = await call_next(request)
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/debug/packages")
async def debug_packages():
    try:
        import pytube
        import whisper  # Import whisper here if available
        return {
            "pytube": {
                "version": getattr(pytube, "__version__", "unknown"),
                "attributes": dir(pytube)
            },
            "whisper": {
                "version": getattr(whisper, "__version__", "unknown"),
                "attributes": dir(whisper)
            }
        }
    except ImportError:
        return {"error": "pytube or whisper not installed"}
