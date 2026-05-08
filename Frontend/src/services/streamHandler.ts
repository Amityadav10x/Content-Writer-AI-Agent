import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { blogApi } from './api';

export class StreamHandler {
  private eventSource: EventSource | null = null;
  private abortController: AbortController | null = null;

  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  public connect() {
    if (this.eventSource) this.disconnect();
    
    const url = blogApi.getStreamUrl(this.jobId);
    this.eventSource = new EventSource(url);
    this.abortController = new AbortController();

    const store = useWorkspaceStore.getState();

    this.eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case 'sync':
            // Initial state synchronization
            if (data.result?.final) store.setArtifactContent(data.result.final);
            break;

          case 'status':
            if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
              store.setGenerating(false);
              this.disconnect();
            }
            if (data.error) store.setError(data.error);
            break;

          case 'node_start':
            store.setNodeStatus(data.node, 'running');
            break;

          case 'node_end':
            store.setNodeStatus(data.node, 'completed');
            if (data.node === 'reducer' && data.output?.final) {
               store.setArtifactContent(data.output.final);
            }
            break;

          case 'token':
            // Logic to decide if token goes to chat or artifact
            // For now, if we are in worker/reducer, it goes to artifact
            if (data.node === 'worker' || data.node === 'reducer') {
              store.appendArtifactContent(data.content);
            } else {
              store.updateLastMessage({ content: (useWorkspaceStore.getState().messages.slice(-1)[0]?.content || '') + data.content });
            }
            break;

          case 'tool_start':
            // Handle tool progress in reasoning timeline
            break;

          case 'artifact_complete':
            store.setArtifactContent(data.content);
            break;

          default:
            console.log('Unhandled event type:', type, data);
        }
      } catch (err) {
        console.error('Error processing stream event:', err);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
      store.setError('Connection lost. Attempting to reconnect...');
      this.disconnect();
      store.setGenerating(false);
    };
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
