import re
import time
import logging
from typing import Optional, Tuple
import yt_dlp
import tempfile
import os
import whisper

logger = logging.getLogger(__name__)

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "tiny.en") 
whisper_model = None

def load_whisper_model_on_startup():
    global whisper_model
    logger.info(f"Loading Whisper model: {WHISPER_MODEL_SIZE}...")
    try:
        whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device="cpu")
        logger.info(f"Whisper model {WHISPER_MODEL_SIZE} loaded successfully.")
    except Exception as e:
        logger.error(f"ERROR: Could not load Whisper model {WHISPER_MODEL_SIZE}: {e}")

def validate_youtube_url(url: str) -> bool:
    logger.debug(f"Validating URL: {url}")
    if not url:
        logger.debug("Empty URL provided")
        return False
        
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        logger.debug("Valid video ID provided")
        return True
        
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^\&]+)',
        r'(?:https?:\/\/)?youtu\.be\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\?]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^\?]+)'
    ]
    logger.debug(f"Testing patterns: {patterns} - Result: {any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)}")
    return any(re.search(pattern, url, re.IGNORECASE) for pattern in patterns)

def get_video_id(url: str) -> str:
    """Extract video ID from URL or return if already an ID"""
    logger.debug(f"Extracting video ID from: {url}")
    
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        logger.debug(f"Video ID is already provided: {url}")
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
            video_id = match.group(1)
            logger.debug(f"Extracted video ID via regex: {video_id}")
            return video_id
        
    raise ValueError(f"Could not extract video ID from URL: {url}")


def get_transcript(url: str) -> Tuple[str, str]:
    """
    Downloads audio from YouTube using yt-dlp and transcribes it using a local Whisper model.
    Returns the transcript text and detected language.
    """
    if whisper_model is None:
        raise ValueError("Whisper model is not loaded. Check server startup logs.")

    try:
        logger.info(f"Starting audio download and transcription for URL: {url}")
        
        video_id = get_video_id(url)
        
        with tempfile.NamedTemporaryFile(suffix=".m4a", delete=True) as temp_audio_file:
            FFMPEG_BIN_PATH = r"C:\Users\ayush\OneDrive\Desktop\ffmpeg-master-latest-win64-gpl-shared\bin" # YOUR FFMPEG PATH

            ydl_opts = {
                'format': 'bestaudio/best',
                'extract_audio': True,
                'audioformat': 'm4a',
                'outtmpl': temp_audio_file.name,
                'quiet': True,
                'no_warnings': True,
                'logger': logging.getLogger('yt_dlp'),
                'ffmpeg_location': FFMPEG_BIN_PATH,
                'postprocessor_args': {
                    'FFmpegExtractAudio': ['-acodec', 'aac'],
                },
                'keepvideo': False,
                'cachedir': False, # ADD THIS LINE: Disable cache for this run
                'no_cache_dir': True, # ADD THIS LINE: Do not use any cache directory
                'overwrites': True, # ADD THIS LINE: Always overwrite existing files
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                logger.debug(f"Downloading and processing audio for {url} using yt-dlp to {temp_audio_file.name}...")
                ydl.download([url])

            logger.info("Audio downloaded and processed. Starting transcription with local Whisper model...")

            if not os.path.exists(temp_audio_file.name) or os.path.getsize(temp_audio_file.name) == 0:
                raise ValueError("Downloaded audio file is empty or missing.")

            result = whisper_model.transcribe(temp_audio_file.name)

            transcript_text = result["text"]
            detected_language = result.get('language', 'unknown')

            logger.info(f"Successfully transcribed video {video_id}. Detected language: {detected_language}")
            return transcript_text, detected_language
            
    except Exception as e:
        logger.error(f"Error processing transcript with local Whisper (via yt-dlp): {e}", exc_info=True)
        raise ValueError(f"Failed to fetch or transcribe audio: {str(e)}")