from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import os
import logging
from typing import List, Dict
from datetime import datetime, timedelta
import time
import hashlib

# Configuration
MODEL_NAME = "gemini-2.0-flash-lite"  # Best free tier model
MAX_TRANSCRIPT_LENGTH = 8000  # Gemini's conservative limit
RATE_LIMIT_DELAY = 2.1  # seconds
CACHE_TTL = 3600  # 1 hour

# State tracking
_last_request_time = 0
_request_count = 0
_summary_cache = {}
_key_points_cache = {}

def normalize_bullets(points: List[str]) -> List[str]:
    """Clean bullet styles (•, *, -) and remove asterisks from text."""
    cleaned = []
    for pt in points:
        pt = pt.strip().lstrip("*-• ").strip()
        pt = pt.replace("**", "")  # Remove double asterisks
        if pt:
            cleaned.append(pt)
    return cleaned


def _rate_limit():
    """Throttle API calls to avoid hitting Gemini's quota."""
    global _last_request_time, _request_count
    elapsed = time.time() - _last_request_time
    if elapsed < RATE_LIMIT_DELAY:
        time.sleep(RATE_LIMIT_DELAY - elapsed)
    _last_request_time = time.time()
    _request_count += 1

def _get_cache_key(text: str) -> str:
    """Generate cache key based on transcript content."""
    return hashlib.md5(text.encode()).hexdigest()

def _call_gemini_with_retry(chain, input_data, max_retries=3):
    """Wrapper with retry logic for Gemini API calls."""
    for attempt in range(max_retries):
        try:
            _rate_limit()
            return chain.invoke(input_data).content
        except Exception as e:
            if attempt == max_retries - 1 or 'quota' in str(e).lower():
                raise
            wait_time = min(2 ** attempt, 10)
            logging.warning(f"Retry {attempt + 1}/{max_retries} - Waiting {wait_time}s")
            time.sleep(wait_time)

def generate_summary(transcript: str) -> str:
    """Generate a clean summary from the transcript."""
    try:
        logging.debug(f"Transcript received (length: {len(transcript)})")

        if not transcript or len(transcript.strip()) < 50:
            logging.warning("Transcript too short - returning default summary")
            return "Summary not available for this video."

        if len(transcript) > MAX_TRANSCRIPT_LENGTH:
            logging.warning(f"Truncating transcript from {len(transcript)} to {MAX_TRANSCRIPT_LENGTH}")
            transcript = transcript[:MAX_TRANSCRIPT_LENGTH]

        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("Gemini API key not configured.")

        cache_key = _get_cache_key(transcript)
        if cache_key in _summary_cache and _summary_cache[cache_key]['expires_at'] > datetime.now():
            return _summary_cache[cache_key]['summary']

        prompt = ChatPromptTemplate.from_template("""
            Summarize the following YouTube video transcript clearly and naturally.

            Guidelines:
            1. Focus on meaningful content only (ignore filler words and repetition).
            2. Capture the main ideas and flow of the video.
            3. Keep it concise (2-3 paragraphs) but complete.

            Transcript:
            {transcript}
        """)

        llm = ChatGoogleGenerativeAI(
            model=MODEL_NAME,
            google_api_key=gemini_key,
            temperature=0.3
        )
        chain = prompt | llm
        result = _call_gemini_with_retry(chain, {"transcript": transcript})

        summary = result.strip()

        _summary_cache[cache_key] = {
            "summary": summary,
            "expires_at": datetime.now() + timedelta(seconds=CACHE_TTL)
        }
        _sync_caches(cache_key)

        return summary

    except Exception as e:
        logging.error(f"Summarization failed: {e}", exc_info=True)
        return "Error generating summary."

def generate_key_points(transcript: str) -> List[str]:
    """Generate normalized bullet-point key points from the transcript."""
    try:
        logging.debug(f"Generating key points for transcript (length: {len(transcript)})")

        if not transcript or len(transcript.strip()) < 50:
            logging.warning("Transcript too short - returning default key points")
            return ["Key points not available for very short videos."]

        if len(transcript) > MAX_TRANSCRIPT_LENGTH:
            logging.warning(f"Truncating transcript from {len(transcript)} to {MAX_TRANSCRIPT_LENGTH}")
            transcript = transcript[:MAX_TRANSCRIPT_LENGTH]

        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("Gemini API key not configured.")

        cache_key = _get_cache_key(transcript)
        if cache_key in _key_points_cache and _key_points_cache[cache_key]['expires_at'] > datetime.now():
            return _key_points_cache[cache_key]['key_points']

        prompt = ChatPromptTemplate.from_template("""
            Extract the 5 most important key points from this YouTube transcript.

            Guidelines:
            1. Present each as a clear, concise bullet (1–2 lines).
            2. Focus only on the most significant facts, events, or ideas.
            3. Remove filler words and unrelated content.

            Transcript:
            {transcript}
        """)

        llm = ChatGoogleGenerativeAI(
            model=MODEL_NAME,
            google_api_key=gemini_key,
            temperature=0.3
        )
        chain = prompt | llm
        result = _call_gemini_with_retry(chain, {"transcript": transcript})

        # Split into lines and normalize bullets
        if "•" in result:
            raw_points = [pt.strip() for pt in result.split("•") if pt.strip()]
        else:
            raw_points = [pt.strip() for pt in result.splitlines() if pt.strip()]
            
        # Remove common prefix text if present
        prefix = "Here are the 5 most important key points from the YouTube transcript:"
        if raw_points and raw_points[0].startswith(prefix):
            raw_points[0] = raw_points[0][len(prefix):].strip()
            
        key_points = normalize_bullets(raw_points)

        _key_points_cache[cache_key] = {
            "key_points": key_points,
            "expires_at": datetime.now() + timedelta(seconds=CACHE_TTL)
        }
        _sync_caches(cache_key)

        return key_points

    except Exception as e:
        logging.error(f"Key point extraction failed: {e}", exc_info=True)
        return ["Error generating key points."]

def _sync_caches(cache_key: str):
    """Ensure summary and key points caches expire together."""
    try:
        if cache_key in _summary_cache and cache_key in _key_points_cache:
            expiry = max(
                _summary_cache[cache_key]["expires_at"],
                _key_points_cache[cache_key]["expires_at"]
            )
            _summary_cache[cache_key]["expires_at"] = expiry
            _key_points_cache[cache_key]["expires_at"] = expiry
    except Exception as e:
        logging.error(f"Cache sync failed: {e}", exc_info=True)

def get_usage_metrics() -> Dict:
    """Return API usage metrics."""
    active_cache = sum(1 for v in _summary_cache.values() if v['expires_at'] > datetime.now())
    active_cache += sum(1 for v in _key_points_cache.values() if v['expires_at'] > datetime.now())
    return {
        "total_requests": _request_count,
        "cache_hits": active_cache,
        "last_request_time": _last_request_time,
        "current_model": MODEL_NAME
    }
