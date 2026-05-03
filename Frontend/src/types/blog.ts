export interface JobStatus {
  status: 'starting' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  logs: string[];
}

export interface GenerateResponse {
  job_id: string;
}
