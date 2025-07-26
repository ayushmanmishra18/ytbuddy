from fastapi import APIRouter, Request, HTTPException
from app.utils.qa import get_answer
import logging
import traceback
import re
import json
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ask")
async def ask_question(request: Request):
    try:
        logger.info("=== NEW ASK REQUEST ===")
        
        # Validate JSON format
        try:
            data = await request.json()
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid JSON format in request body"
            )
        
        # Validate input structure
        if not isinstance(data, dict):
            raise HTTPException(
                status_code=400,
                detail="Request body must be a JSON object"
            )
            
        # Extract and validate required fields
        video_id = data.get("video_id")
        question = data.get("question")
        
        if not video_id or not question:
            raise HTTPException(
                status_code=400,
                detail="Both 'video_id' and 'question' fields are required"
            )
            
        # Validate video ID format
        if len(video_id) > 100 or not re.match(r'^[a-zA-Z0-9_-]{11}$', video_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid video ID format. Must be exactly 11 alphanumeric characters"
            )
            
        # Validate question length
        if len(question) > 500:
            raise HTTPException(
                status_code=400,
                detail="Question too long. Maximum 500 characters allowed"
            )
            
        logger.debug(f"Processing question for video {video_id}: {question[:50]}...")
        
        # Get answer from QA system
        answer = get_answer(video_id, question)
        
        # Format response based on answer type
        if "Based on the video:" in answer and "Beyond the video:" in answer:
            response_data = {
                "type": "beyond",
                "transcript_answer": answer.split("Based on the video:")[1].split("Beyond the video:")[0].strip(),
                "general_answer": answer.split("Beyond the video:")[1].strip()
            }
        elif "Based on the video:" in answer:
            response_data = {
                "type": "default",
                "answer": answer.replace("Based on the video:", "").strip()
            }
        elif "Answer:" in answer:
            response_data = {
                "type": "buddy",
                "answer": answer.replace("Answer:", "").strip()
            }
        else:
            response_data = {
                "type": "default",
                "answer": answer
            }
        
        return {
            "status": "success",
            "data": response_data,
            "video_id": video_id,
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ask endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question"
        )
