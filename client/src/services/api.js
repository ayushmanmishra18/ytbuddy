// src/services/api.js

// Determine API Base URL (local or production)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://ayushman18-ytbuddy.hf.space' // Production backend
    : 'http://127.0.0.1:8000');             // Local dev backend

// Fetch analysis for a YouTube video (transcript, summary, key points)
export const analyzeVideo = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(
      error.message || 'Failed to analyze video. Please try again.'
    );
  }
};

// Ask a contextual question (transcript/buddy/beyond modes)
export const askQuestion = async ({ video_id, question }) => {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id, question }),
  });

  if (!response.ok) {
    throw new Error(`Error asking question: ${response.statusText}`);
  }

  const data = await response.json();

  // Ensure response matches what VideoAnalysis.jsx expects
  return {
    data: {
      answer: data.answer || data.general_answer || '',
      transcript_answer: data.transcript_answer || '',
      general_answer: data.general_answer || '',
      type: data.type || 'default',
    },
  };
};

// Backend health check (optional)
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
