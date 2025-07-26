import re
import logging
import tempfile
import os
import yt_dlp
import whisper
from typing import Tuple

logger = logging.getLogger(__name__)

# Load Whisper model size (tiny.en by default)
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "tiny.en")
whisper_model = None

def load_whisper_model_on_startup():
    """Load Whisper model at app startup with proper cache settings."""
    global whisper_model
    try:
        # Configure cache directories for Hugging Face Spaces
        os.environ["XDG_CACHE_HOME"] = "/tmp/.cache"
        os.environ["TRANSFORMERS_CACHE"] = "/tmp/.cache"

        logger.info(f"Loading Whisper model: {WHISPER_MODEL_SIZE}...")
        whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device="cpu")
        logger.info(f"Whisper model {WHISPER_MODEL_SIZE} loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}", exc_info=True)
        raise RuntimeError(f"Could not load Whisper model: {e}")

def get_video_id(url: str) -> str:
    """Extract the video ID from a YouTube URL with robust validation."""
    try:
        if not url:
            raise ValueError("Empty URL provided")
            
        if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
            return url
            
        patterns = [
            r'[?&]v=([^&]+)',
            r'youtu\.be\/([^?]+)',
            r'embed\/([^?]+)',
            r'v\/([^?]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1)
                
        raise ValueError(f"Could not extract video ID from URL: {url[:50]}...")
    except Exception as e:
        logger.error(f"Video ID extraction failed: {e}")
        raise

def download_audio(url: str, output_path: str) -> str:
    """Download YouTube audio with proper cleanup and error handling."""
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'extract_audio': True,
            'audioformat': 'm4a',
            'outtmpl': output_path,
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'ffmpeg_location': os.getenv('FFMPEG_PATH')  # Configurable FFMPEG path
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise RuntimeError("Downloaded audio file is empty or missing")
            
        return output_path
    except Exception as e:
        logger.error(f"Audio download failed: {e}", exc_info=True)
        if os.path.exists(output_path):
            os.remove(output_path)
        raise RuntimeError(f"Audio download failed: {e}")

def get_local_transcript(url: str) -> Tuple[str, str]:
    """
    Get transcript from YouTube URL with robust error handling.
    Returns:
        Tuple of (transcript_text, detected_language)
    """
    if whisper_model is None:
        raise RuntimeError("Whisper model not loaded")

    temp_file = None
    try:
        video_id = get_video_id(url)
        logger.info(f"Processing video: {video_id}")

        # Create temp file with explicit path for Windows compatibility
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"ytbuddy_{video_id}.m4a")
        
        # Download audio
        download_audio(url, temp_path)
        
        # Transcribe
        logger.info("Starting transcription...")
        result = whisper_model.transcribe(temp_path)
        
        transcript = result.get("text", "")
        language = result.get("language", "unknown")
        
        logger.info(f"Transcription successful (lang: {language}, chars: {len(transcript)})")
        return transcript, language
        
    except Exception as e:
        logger.error(f"Transcript processing failed: {e}", exc_info=True)
        raise RuntimeError(f"Transcript processing failed: {e}")
    finally:
        # Cleanup temp file
        if temp_file and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Could not delete temp file: {e}")

def get_transcript(url: str) -> Tuple[str, str]:
    """
    Get transcript with multiple fallback methods:
    1. Try YouTube Transcript API
    2. Try proxy service for yt-dlp
    3. Final fallback to error message
    """
    try:
        video_id = get_video_id(url)
        
        # Method 1: YouTube Transcript API
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return " ".join([t['text'] for t in transcript]), "en"
        except Exception as api_error:
            logger.warning(f"YouTube API failed: {str(api_error)}")
            
        # Method 2: Proxy service for yt-dlp
        try:
            if os.getenv('USE_PROXY', '').lower() == 'true':
                return get_proxied_transcript(url)
        except Exception as proxy_error:
            logger.error(f"Proxy method failed: {str(proxy_error)}")
            
        raise RuntimeError(
            "All transcript methods failed. "
            "Please check if YouTube is accessible from this network."
        )
    except Exception as e:
        logger.error(f"Transcript failed: {str(e)}", exc_info=True)
        raise

def get_proxied_transcript(url: str) -> Tuple[str, str]:
    """Get transcript through RapidAPI proxy"""
    try:
        import requests
        
        video_id = get_video_id(url)
        api_key = os.getenv('RAPIDAPI_KEY')
        if not api_key:
            raise RuntimeError("RapidAPI key not configured")
            
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "youtube-transcriptor.p.rapidapi.com"
        }
        
        params = {"video_id": video_id}
        
        response = requests.get(
            "https://youtube-transcriptor.p.rapidapi.com/transcript",
            headers=headers,
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json().get("transcript", ""), "en"
        else:
            raise RuntimeError(f"Proxy API failed: {response.text}")
    except Exception as e:
        logger.error(f"Proxy transcript failed: {str(e)}")
        raise

def fetch_youtube_api_transcript(video_id: str) -> str:
    """Fetch transcript using YouTube Data API"""
    try:
        # Implementation using youtube-transcript-api
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([t['text'] for t in transcript])
    except Exception as e:
        logger.warning(f"YouTube API transcript failed: {str(e)}")
        return ""
