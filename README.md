# ytbuddy - YouTube Video Analysis Companion

## 📌 Summary
A powerful AI tool that lets you ask questions about YouTube videos. It combines:
- Whisper AI for accurate transcriptions
- Gemini for intelligent Q&A
- Modern web stack for smooth user experience

## 🔑 Key Points
- **Instant Insights**: Get answers from videos without watching
- **AI-Powered**: Combines Whisper and Gemini for best results
- **Easy Deployment**: Pre-configured for Render and Hugging Face
- **Developer Friendly**: Clean codebase with full documentation
- **Scalable**: Dockerized backend with efficient processing

## ✨ Features
- **Video Analysis**: Extract and analyze YouTube video content
- **AI Q&A**: Get answers to your questions about video content using Gemini AI
- **Transcript Processing**: Clean and store video transcripts
- **Usage Metrics**: Track API usage and system performance
- **Modern UI**: Built with React, TailwindCSS, and Vite

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: FastAPI + Whisper + Gemini API
- **Database**: ChromaDB for vector storage

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google API key (for YouTube access)
- Gemini API key

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ayushmanmishra18/ytbuddy1.1.git
   cd ytbuddy1
   ```

2. Set up backend:
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up frontend:
   ```bash
   cd ../client
   npm install
   ```

4. Create `.env` files:
   - Copy `server/.env.example` to `server/.env` and fill in your API keys
   - Copy `client/.env.example` to `client/.env`

### Running Locally
1. Start backend:
   ```bash
   cd server
   python main.py
   or
   uvicorn main:app --reload
   ```

2. Start frontend (in another terminal):
   ```bash
   cd client
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## 🌐 Deployment

### Frontend - Render
- Deployed at: [https://ytbuddy1-1.onrender.com](https://ytbuddy1-1.onrender.com)
- Configured via `render.yaml`
- Automatically deploys from GitHub

### Backend - Hugging Face Spaces
- Deployed at: [https://ayushman18-ytbuddy.hf.space/](https://ayushman18-ytbuddy.hf.space/)
- Uses Docker container with:
  - FastAPI backend
  - Whisper model pre-loaded
  - Environment variables configured in Spaces settings

## 🚀 How It Works

1. **Frontend** (React/Vite):
   - Hosted on Render
   - Connects to Hugging Face backend
   - Provides UI for video URL input and Q&A

2. **Backend** (FastAPI/Whisper/Gemini):
   - Hosted on Hugging Face Spaces
   - Processes YouTube URLs (via yt-dlp)
   - Generates transcripts (using Whisper)
   - Answers questions (using Gemini AI)
   - Returns structured responses

3. **Workflow**:
   - User submits YouTube URL
   - Backend extracts audio and generates transcript
   - Gemini AI analyzes transcript when questions are asked
   - Responses are displayed in the frontend

## 📚 Documentation

### API Endpoints
- `POST /api/ask` - Ask questions about a video (requires `video_id` and `question`)
- `GET /api/metrics` - Get usage metrics

## 📸 Project Overview

The application consists of:
- React frontend (in `/client`)
- FastAPI backend (in `/server`)
- AI integration with Whisper and Gemini
- ChromaDB for vector storage

For a visual demo, please visit the deployed version.

## 🔍 Detailed API Documentation

### Authentication
All API endpoints require a valid API key sent in the `X-API-KEY` header.

### Endpoints

#### `POST /api/ask`
Ask questions about a YouTube video

**Request Body**:
```json
{
  "video_id": "YouTube video ID",
  "question": "Your question about the video"
}
```

**Response**:
```json
{
  "answer": "AI-generated response",
  "sources": ["relevant transcript excerpts"]
}
```

## 🛠 Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit changes with descriptive messages
3. Push to your branch
4. Open a pull request for review

## 🧪 Testing
Run tests with:
```bash
cd server
pytest tests/
```

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌟 Features Roadmap
- [ ] User authentication
- [ ] Video summarization
- [ ] Multi-language support
- [ ] Browser extension

## ⚠️ Troubleshooting
- **Missing API keys**: Ensure all required keys are in `server/.env`
- **Port conflicts**: Check if ports 8000 (backend) and 5173 (frontend) are available
- **Python dependencies**: Reinstall requirements if facing module errors

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact
Ayushman Mishra - [@ayushmanmishra18](https://github.com/ayushmanmishra18)
