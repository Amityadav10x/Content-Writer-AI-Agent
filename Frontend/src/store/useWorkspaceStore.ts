import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  status?: 'pending' | 'streaming' | 'complete' | 'failed';
  timestamp: number;
}

export interface ExecutionNode {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
}

interface WorkspaceState {
  threadId: string | null;
  messages: Message[];
  artifactContent: string;
  activeNode: string | null;
  nodes: Record<string, ExecutionNode>;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setThreadId: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (update: Partial<Message>) => void;
  setArtifactContent: (content: string) => void;
  appendArtifactContent: (chunk: string) => void;
  setNodeStatus: (nodeId: string, status: ExecutionNode['status'], label?: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      threadId: null,
      messages: [],
      artifactContent: '',
      activeNode: null,
      nodes: {
        router: { id: 'router', label: 'Analyzing Topic', status: 'pending' },
        research: { id: 'research', label: 'Web Research', status: 'pending' },
        orchestrator: { id: 'orchestrator', label: 'Planning Structure', status: 'pending' },
        worker: { id: 'worker', label: 'Writing Content', status: 'pending' },
        reducer: { id: 'reducer', label: 'Finalizing Blog', status: 'pending' },
      },
      isGenerating: false,
      error: null,

      setThreadId: (id) => set({ threadId: id }),

      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          { 
            ...message, 
            id: Math.random().toString(36).substring(7), 
            timestamp: Date.now() 
          }
        ]
      })),

      updateLastMessage: (update) => set((state) => {
        const newMessages = [...state.messages];
        if (newMessages.length > 0) {
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], ...update };
        }
        return { messages: newMessages };
      }),

      setArtifactContent: (content) => set({ artifactContent: content }),

      appendArtifactContent: (chunk) => set((state) => ({ 
        artifactContent: state.artifactContent + chunk 
      })),

      setNodeStatus: (nodeId, status, label) => set((state) => {
        const node = state.nodes[nodeId] || { id: nodeId, label: label || nodeId, status: 'pending' };
        const updatedNode = { 
          ...node, 
          status, 
          label: label || node.label,
          startTime: status === 'running' ? Date.now() : node.startTime,
          endTime: (status === 'completed' || status === 'failed') ? Date.now() : node.endTime
        };
        
        return {
          activeNode: status === 'running' ? nodeId : state.activeNode,
          nodes: { ...state.nodes, [nodeId]: updatedNode }
        };
      }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),

      resetWorkspace: () => set({
        messages: [],
        artifactContent: '',
        activeNode: null,
        isGenerating: false,
        error: null,
        nodes: {
          router: { id: 'router', label: 'Analyzing Topic', status: 'pending' },
          research: { id: 'research', label: 'Web Research', status: 'pending' },
          orchestrator: { id: 'orchestrator', label: 'Planning Structure', status: 'pending' },
          worker: { id: 'worker', label: 'Writing Content', status: 'pending' },
          reducer: { id: 'reducer', label: 'Finalizing Blog', status: 'pending' },
        },
      }),
    }),
    {
      name: 'blog-workspace-storage',
      version: 2, // bump to invalidate stale persisted state
      migrate: (_persistedState, _version) => {
        // On schema change, reset to clean defaults
        return {
          threadId: null,
          messages: [],
          artifactContent: '',
        };
      },
      partialize: (state) => ({
        threadId: state.threadId,
        messages: state.messages.map(m => ({
          // Sanitize messages before persisting — drop non-serializable fields
          id: m.id,
          role: m.role,
          content: m.content,
          status: m.status === 'streaming' ? 'complete' : m.status, // never persist streaming state
          timestamp: m.timestamp,
        })),
        artifactContent: state.artifactContent,
      }),
    }
  )
);
