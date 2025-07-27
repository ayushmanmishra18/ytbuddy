export const analyzeVideo = async (url) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ url })
  });
  return await response.json();
};

export const askQuestion = async ({video_id, question}) => {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ video_id, question })
  });
  return await response.json();
};

export const checkHealth = async () => {
  try {
    console.log('Sending health check request');
    const response = await fetch('/health');
    const data = await response.json();
    console.log('Health check response:', data);
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
