import re
import logging
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, WebSocket
from fastapi.websockets import WebSocketDisconnect
from pydantic import BaseModel

from app.utils.transcript import get_transcript
from app.utils.summarizer import generate_summary, generate_key_points, get_usage_metrics
from app.utils.embed_store import store_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    url: str

def validate_youtube_url(url: str) -> bool:
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^\&]+)',
        r'(?:https?:\/\/)?youtu\.be\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\?]+)'
    ]
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)',
        r'(?:https?:\/\/)?youtu\.be\/([^?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise HTTPException(status_code=400, detail="Invalid YouTube URL format")

async def process_video(url: str) -> dict:
    try:
        logger.info(f"Starting video processing for URL: {url}")
        
        # Validate URL before processing
        if not validate_youtube_url(url):
            raise HTTPException(status_code=400, detail="Invalid YouTube URL format")
            
        logger.info("Getting transcript...")
        try:
            transcript, language = get_transcript(url)
        except Exception as e:
            logger.error(f"Transcript failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500, 
                detail=f"Could not get transcript: {str(e)}"
            )
            
        logger.info(f"Transcript received (length: {len(transcript)} chars)")
        
        # Generate analysis with fallbacks
        summary = "Summary not available"
        key_points = ["Key points not available"]
        try:
            summary = generate_summary(transcript) or summary
            key_points = generate_key_points(transcript) or key_points
        except Exception as e:
            logger.error(f"Analysis generation failed: {str(e)}")
            # Continue with default values

        video_id = extract_video_id(url)
        
        # Async embedding storage (non-critical)
        try:
            if callable(store_embeddings):
                await asyncio.to_thread(store_embeddings, video_id, transcript)
        except Exception as e:
            logger.error(f"Non-critical: Embedding storage failed: {str(e)}")

        return {
            "status": "success",
            "analysis": {
                "summary": summary,
                "key_points": key_points,
                "language": language,
                "transcript": transcript
            },
            "video_id": video_id,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Video processing failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {str(e)}"
        )

@router.post("/analyze")
async def analyze_video(data: AnalyzeRequest):
    logger.info(f"Analysis request: {data.url}")
    if not data.url or not validate_youtube_url(data.url):
        raise HTTPException(status_code=400, detail="Valid YouTube URL required")
    return await process_video(data.url)

@router.get("/usage")
async def get_usage_stats():
    return {
        "status": "success",
        "metrics": get_usage_metrics(),
        "server_time": datetime.now().isoformat()
    }

@router.websocket("/ws/status/{video_id}")
async def websocket_status(websocket: WebSocket, video_id: str):
    await websocket.accept()
    try:
        for progress in range(0, 101, 20):
            await websocket.send_json({"status": "processing", "progress": progress, "video_id": video_id})
            await asyncio.sleep(1)
        await websocket.send_json({"status": "completed", "video_id": video_id})
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {video_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
