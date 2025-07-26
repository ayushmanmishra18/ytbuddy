import re
import time
import logging
from typing import Tuple
import yt_dlp
import tempfile
import os
import whisper

logger = logging.getLogger(__name__)

# Default model size (tiny.en for Hugging Face Spaces)
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "tiny.en")
whisper_model = None

def load_whisper_model_on_startup():
    """
    Loads Whisper model and fixes cache directory issues for Hugging Face Spaces.
    """
    global whisper_model
    try:
        # Ensure cache uses a writable directory
        os.environ["XDG_CACHE_HOME"] = "/tmp/.cache"
        os.environ["TRANSFORMERS_CACHE"] = "/tmp/.cache"

        logger.info(f"Loading Whisper model: {WHISPER_MODEL_SIZE}...")
        whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device="cpu")
        logger.info(f"Whisper model {WHISPER_MODEL_SIZE} loaded successfully.")
    except Exception as e:
        logger.error(f"ERROR: Could not load Whisper model {WHISPER_MODEL_SIZE}: {e}")
        whisper_model = None

def validate_youtube_url(url: str) -> bool:
    """
    Checks if a given URL or ID is a valid YouTube video link.
    """
    if not url:
        return False

    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return True

    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^\&]+)',
        r'(?:https?:\/\/)?youtu\.be\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^\?]+)'
    ]
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def get_video_id(url: str) -> str:
    """
    Extracts YouTube video ID from URL or returns the input if already an ID.
    """
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url

    patterns = [
        r'[?&]v=([^&]+)',
        r'youtu\.be\/([^?]+)',
        r'shorts\/([^?]+)',
        r'embed\/([^?]+)',
        r'v\/([^?]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1)

    raise ValueError(f"Could not extract video ID from URL: {url}")

def get_transcript(url: str) -> Tuple[str, str]:
    """
    Downloads audio using yt-dlp and transcribes with Whisper.
    Returns (transcript text, detected language).
    """
    if whisper_model is None:
        raise ValueError("Whisper model is not loaded. Check server startup logs.")

    try:
        video_id = get_video_id(url)
        logger.info(f"Processing video {video_id} for transcript...")

        with tempfile.NamedTemporaryFile(suffix=".m4a", delete=True) as temp_audio_file:
            ydl_opts = {
                'format': 'bestaudio/best',
                'extract_audio': True,
                'audioformat': 'm4a',
                'outtmpl': temp_audio_file.name,
                'quiet': True,
                'no_warnings': True,
                'logger': logging.getLogger('yt_dlp'),
                # Let yt-dlp use default ffmpeg (Spaces provides it)
                'postprocessor_args': {'FFmpegExtractAudio': ['-acodec', 'aac']},
                'keepvideo': False,
                'cachedir': False,
                'no_cache_dir': True,
                'overwrites': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                logger.debug(f"Downloading audio for {url}...")
                ydl.download([url])

            if not os.path.exists(temp_audio_file.name) or os.path.getsize(temp_audio_file.name) == 0:
                raise ValueError("Downloaded audio file is empty or missing.")

            logger.info("Starting Whisper transcription...")
            result = whisper_model.transcribe(temp_audio_file.name)
            transcript_text = result["text"]
            detected_language = result.get('language', 'unknown')

            logger.info(f"Transcription complete for {video_id}, language: {detected_language}")
            return transcript_text, detected_language

    except Exception as e:
        logger.error(f"Error processing transcript: {e}", exc_info=True)
        raise ValueError(f"Failed to fetch or transcribe audio: {str(e)}")
