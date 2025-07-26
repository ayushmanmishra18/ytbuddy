# Use a Python base image (Debian based, good for apt-get)
# Python 3.10 is a good stable choice that supports your dependencies.
FROM python:3.10-slim-buster

# Set environment variables for non-interactive apt-get (prevents prompts during apt-get install)
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
# ffmpeg: Crucial for yt-dlp's audio extraction and post-processing
# git: Good practice for cloning repos if needed, though not strictly for this app
# curl: Often useful for health checks or debugging, lightweight
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
# This is where your application code will reside
WORKDIR /app

# Copy requirements.txt from your 'server' subdirectory
# to the container's /app directory, then install Python dependencies.
# This is done separately to leverage Docker caching (if requirements.txt doesn't change, this layer is cached)
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper model during the build (Crucial for performance and persistence)
# This uses the same logic as your Render build command, using openai-whisper[cpu]
# The WHISPER_MODEL_SIZE is passed as a build-arg or defaults to 'tiny.en'
# This ensures the model weights are part of the Docker image.
ARG WHISPER_MODEL_SIZE="tiny.en" # Default for the build process if not overridden
RUN python -c "import os; import whisper; model_size = os.environ.get('WHISPER_MODEL_SIZE', 'tiny.en'); whisper.load_model(model_size); print(f'Whisper {model_size} model pre-downloaded during build.')"

# Copy the entire project from your local 'ytbuddy1' directory
# to the container's /app directory.
# The 'server' folder (containing main.py, app/, etc.) will be at /app/server
# The 'client' folder will be at /app/client
COPY . .

# Set environment variables for the FastAPI app at runtime
# These will be populated by Hugging Face Spaces environment variables
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
# WHISPER_MODEL_SIZE for runtime (overrides default from build if set by HF Space)
ENV WHISPER_MODEL_SIZE=${WHISPER_MODEL_SIZE}

# Expose the port your FastAPI app will listen on (default for Uvicorn)
EXPOSE 8000

# Command to run your FastAPI application with Uvicorn
# The main.py file is located inside the 'server' subdirectory relative to /app
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]