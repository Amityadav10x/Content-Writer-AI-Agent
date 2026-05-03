import { useState, useEffect, useCallback } from 'react';
import type { JobStatus } from '../types/blog';
import { blogApi } from '../services/api';

export function useBlogAgent() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setStatus({ status: 'starting', logs: [] });
    
    try {
      const data = await blogApi.generate(topic);
      setJobId(data.job_id);
    } catch (err) {
      console.error('Generation failed:', err);
      setIsGenerating(false);
      setStatus({ 
        status: 'failed', 
        error: 'Could not connect to backend server.', 
        logs: [] 
      });
    }
  }, [topic]);

  // Real-time streaming via SSE
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    if (jobId && (status?.status === 'starting' || status?.status === 'running')) {
      eventSource = new EventSource(blogApi.getStreamUrl(jobId));
      
      eventSource.onmessage = (event) => {
        try {
          const data: JobStatus = JSON.parse(event.data);
          setStatus(data);
          
          if (data.status === 'completed' || data.status === 'failed') {
            setIsGenerating(false);
            eventSource?.close();
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        eventSource?.close();
        // Fallback to manual status check if stream fails
        setIsGenerating(false);
      };
    }
    
    return () => {
      eventSource?.close();
    };
  }, [jobId, status?.status]);

  return {
    topic,
    setTopic,
    isGenerating,
    status,
    handleGenerate,
  };
}
