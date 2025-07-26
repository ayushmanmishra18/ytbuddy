// src/services/api.js

// Base API URL: Use .env if set, fallback to Hugging Face for production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://ayushman18-ytbuddy.hf.space' // Production backend
    : 'http://127.0.0.1:8000');             // Local dev backend

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
  return response.json();
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
  return response.json();
};

// Health check for backend connectivity
export const checkHealth = async () => {
  try {
    console.log(`Checking backend health at: ${API_BASE_URL}`);
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
