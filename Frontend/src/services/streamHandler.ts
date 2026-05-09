import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { blogApi } from './api';

// Which nodes produce content that should go to the artifact panel
const ARTIFACT_NODES = new Set(['worker', 'reducer', 'merge_content', 'generate_and_place_images']);

export class StreamHandler {
  private eventSource: EventSource | null = null;

  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  public connect() {
    if (this.eventSource) this.disconnect();

    const url = blogApi.getStreamUrl(this.jobId);
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;
        const store = useWorkspaceStore.getState();

        switch (type) {
          // ── Initial sync: job object sent immediately on stream connect ──
          case 'sync': {
            console.log('[SSE] Sync received. Job status:', data.status);
            if (data.result?.final) {
              store.setArtifactContent(data.result.final);
            }
            break;
          }

          // ── Job status changes ──────────────────────────────────────────
          case 'status': {
            const { status, error } = data;
            console.log('[SSE] Status:', status);
            if (status === 'completed' || status === 'failed' || status === 'cancelled') {
              store.setGenerating(false);
              store.updateLastMessage({ status: status === 'completed' ? 'complete' : 'failed' });
              this.disconnect();
            }
            if (error) {
              store.setError(error);
            }
            break;
          }

          // ── Node started ────────────────────────────────────────────────
          case 'node_start': {
            const { node } = data;
            console.log('[SSE] Node started:', node);
            store.setNodeStatus(node, 'running');
            // Update the assistant message to reflect what the agent is doing
            const labels: Record<string, string> = {
              retrieve_memory: 'Loading memory context...',
              router:          'Analyzing your topic...',
              research:        'Searching the web...',
              orchestrator:    'Planning blog structure...',
              worker:          'Writing content sections...',
              reducer:         'Finalizing & polishing...',
              extract_memory:  'Saving insights to memory...',
            };
            if (labels[node]) {
              store.updateLastMessage({ content: labels[node], status: 'streaming' });
            }
            break;
          }

          // ── Node finished ───────────────────────────────────────────────
          case 'node_end': {
            const { node, output } = data;
            console.log('[SSE] Node ended:', node);
            store.setNodeStatus(node, 'completed');
            // Capture final content when the reducer completes
            if ((node === 'reducer' || node === 'generate_and_place_images') && output?.final) {
              store.setArtifactContent(output.final);
            }
            break;
          }

          // ── Token streaming ─────────────────────────────────────────────
          case 'token': {
            const { content, node } = data;
            if (!content) break;
            if (ARTIFACT_NODES.has(node)) {
              store.appendArtifactContent(content);
            } else {
              // Router / Orchestrator tokens go to the assistant chat bubble
              const current = useWorkspaceStore.getState().messages.slice(-1)[0];
              const currentContent = current?.content || '';
              // Don't append if it starts with a status label (overwrite instead)
              const isLabel = currentContent.endsWith('...');
              store.updateLastMessage({
                content: isLabel ? content : currentContent + content,
                status: 'streaming',
              });
            }
            break;
          }

          // ── Final artifact delivered (end-of-stream) ────────────────────
          case 'artifact_complete': {
            console.log('[SSE] Artifact complete. Length:', data.content?.length);
            store.setArtifactContent(data.content);
            store.updateLastMessage({ content: '✅ Blog generated successfully! Review the Artifact panel →', status: 'complete' });
            break;
          }

          default:
            console.log('[SSE] Unhandled event type:', type, data);
        }
      } catch (err) {
        console.error('[SSE] Error processing stream event:', err, event.data);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('[SSE] Connection Error:', err);
      const store = useWorkspaceStore.getState();
      store.setError('Connection lost. The agent may still be running — please wait.');
      store.setGenerating(false);
      this.disconnect();
    };
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
