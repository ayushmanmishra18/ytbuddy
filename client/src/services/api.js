// src/services/api.js

// Dynamically select API base URL: Local (dev) or Hugging Face (production)
const API_BASE_URL = import.meta.env.PROD
  ? 'https://ayushman18-ytbuddy.hf.space'  // Hugging Face backend (Production)
  : 'http://127.0.0.1:8000';               // Local backend (Development)

// Analyze a YouTube video (fetch transcript & summary)
export const analyzeVideo = async (url) => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Error analyzing video: ${response.statusText}`);
  }

  return await response.json();
};

// Ask a question about a video (context-aware Q&A)
export const askQuestion = async ({ video_id, question }) => {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id, question }),
  });

  if (!response.ok) {
    throw new Error(`Error asking question: ${response.statusText}`);
  }

  return await response.json();
};

// Health check for backend connectivity
export const checkHealth = async () => {
  try {
    console.log('Sending health check request...');
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Health check response:', data);
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};
