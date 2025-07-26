# app/routes/analyze.py
import re
import os
import logging
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, WebSocket
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional
from fastapi.websockets import WebSocketDisconnect
from app.utils.transcript import get_transcript # Only keep get_transcript
from app.utils.summarizer import generate_summary, generate_key_points, get_usage_metrics
from app.utils.embed_store import store_embeddings

router = APIRouter()
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    url: str

def validate_youtube_url(url: str) -> bool:
    """Validate all common YouTube URL formats"""
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^\&]+)',
        r'(?:https?:\/\/)?youtu\.be\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^\?]+)'
    ]
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def get_video_id(url: str) -> str:
    """Extract video ID from YouTube URL with robust pattern matching"""
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

async def process_video(video_id: str) -> dict:
    """Core video processing pipeline with enhanced error handling"""
    try:
        # Get transcript (now always using local Whisper via pytube)
        # get_transcript now returns (transcript_text, language)
        transcript, language = get_transcript(video_id) 
        
        # Generate analysis components
        summary = generate_summary(transcript)
        key_points = generate_key_points(transcript) or ["Key points not available"]
        
        # Safe embedding storage
        try:
            if store_embeddings and callable(store_embeddings):
                # Use asyncio.to_thread for blocking (synchronous) calls like store_embeddings
                await asyncio.to_thread(store_embeddings, video_id, transcript) 
        except Exception as e:
            logger.error(f"Embedding storage failed (non-critical): {str(e)}")

        return {
            "status": "success",
            "analysis": {
                "summary": summary,
                "key_points": key_points,
                "language": language,
                "transcript": transcript  # Ensure transcript is included
            },
            "video_id": video_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Video processing failed: {str(e)}", exc_info=True)
        # Re-raise HTTPException to be caught by the outer analyze_video endpoint
        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {str(e)}"
        )
@router.post("/analyze")
async def analyze_video(request: Request, data: AnalyzeRequest):
    """Main analysis endpoint with comprehensive validation"""
    try:
        logger.info(f"Analysis request received for: {data.url[:50]}...")
        
        if not os.getenv('GEMINI_API_KEY'):
            raise HTTPException(
                status_code=500,
                detail="Server configuration error: Missing API key"
            )
            
        if not data.url or not validate_youtube_url(data.url):
            raise HTTPException(
                status_code=400,
                detail="Valid YouTube URL required"
            )
            
        video_id = get_video_id(data.url)
        response = await process_video(video_id)
        
        logger.info(f"Successfully processed video: {video_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/usage")
async def get_usage_stats():
    """API usage metrics endpoint"""
    return {
        "status": "success",
        "metrics": get_usage_metrics(),
        "server_time": datetime.now().isoformat()
    }

@router.get("/status/{video_id}")
async def get_processing_status(video_id: str):
    """Video processing status endpoint"""
    return {
        "status": "completed",
        "video_id": video_id,
        "last_updated": datetime.now().isoformat()
    }

@router.websocket("/ws/status/{video_id}")
async def websocket_status(websocket: WebSocket, video_id: str):
    """WebSocket endpoint for real-time status updates"""
    await websocket.accept()
    try:
        for progress in range(0, 101, 10):
            status = {
                "status": "processing",
                "progress": progress,
                "video_id": video_id
            }
            await websocket.send_json(status)
            await asyncio.sleep(1)
        
        await websocket.send_json({
            "status": "completed",
            "video_id": video_id
        })
    except WebSocketDisconnect:
        logger.info(f"Client disconnected for video {video_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")