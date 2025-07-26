# Use lightweight Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for some Python packages like Whisper)
RUN apt-get update && apt-get install -y \
    git ffmpeg libsndfile1 && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Upgrade pip and install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r server/requirements.txt

# Expose Hugging Face default port
EXPOSE 7860

# Run FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
