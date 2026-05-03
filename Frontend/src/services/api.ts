import type { JobStatus, GenerateResponse } from '../types/blog';

const API_BASE_URL = 'http://localhost:8000';

export const blogApi = {
  generate: async (topic: string): Promise<GenerateResponse> => {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        as_of: new Date().toISOString().split('T')[0],
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  getStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  getStreamUrl: (jobId: string): string => {
    return `${API_BASE_URL}/stream/${jobId}`;
  },
};
