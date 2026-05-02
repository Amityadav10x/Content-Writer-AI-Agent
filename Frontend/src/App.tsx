import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Terminal, 
  Send, 
  Download, 
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Types ---
interface JobStatus {
  status: 'starting' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  logs: string[];
}

// --- Components ---

const StatusBadge = ({ status }: { status: JobStatus['status'] }) => {
  const configs = {
    starting: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Initializing' },
    running: { color: 'bg-blue-500/10 text-blue-500', label: 'Processing' },
    completed: { color: 'bg-green-500/10 text-green-500', label: 'Ready' },
    failed: { color: 'bg-red-500/10 text-red-500', label: 'Error' },
  };

  const config = configs[status];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-current/20 ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function App() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'plan' | 'evidence' | 'logs'>('preview');

  // Polling for status
  useEffect(() => {
    let interval: number;
    if (jobId && (status?.status === 'starting' || status?.status === 'running')) {
      interval = window.setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/status/${jobId}`);
          const data = await res.json();
          setStatus(data);
          if (data.status === 'completed' || data.status === 'failed') {
            setIsGenerating(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, status]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setStatus({ status: 'starting', logs: [] });
    
    try {
      const res = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, as_of: new Date().toISOString().split('T')[0] }),
      });
      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      setIsGenerating(false);
      setStatus({ status: 'failed', error: 'Could not connect to backend server.', logs: [] });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Blog<span className="text-accent">Agent</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {status && <StatusBadge status={status.status} />}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Configuration</h2>
            <div className="space-y-2">
              <label className="text-xs text-secondary font-medium">Topic or Prompt</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What should the blog be about?"
                className="w-full h-32 bg-secondary border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Start Generation'}
            </button>
          </section>

          {/* Progress Logs Preview */}
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Live Progress</h2>
              <Terminal className="w-4 h-4 text-secondary" />
            </div>
            <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar pr-2">
              {status?.logs.length === 0 && <p className="text-xs text-secondary italic">Waiting for process to start...</p>}
              {status?.logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-accent">→</span>
                  <p className="text-foreground/80 line-clamp-2">{log}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Content: Output */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card overflow-hidden flex flex-col h-[750px]">
            {/* Tabs */}
            <div className="flex border-b border-border bg-secondary/30">
              {['preview', 'plan', 'evidence', 'logs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab ? 'text-accent' : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'preview' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-invert prose-accent max-w-none"
                  >
                    {!status?.result?.final && !isGenerating && (
                      <div className="h-96 flex flex-col items-center justify-center text-secondary gap-4">
                        <FileText className="w-12 h-12 opacity-20" />
                        <p>No blog generated yet. Enter a topic to begin.</p>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-accent" />
                        <p className="text-secondary animate-pulse">Our agents are researching and writing...</p>
                      </div>
                    )}
                    {status?.result?.final && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {status.result.final}
                      </ReactMarkdown>
                    )}
                  </motion.div>
                )}

                {activeTab === 'plan' && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold">Generation Plan</h3>
                    {status?.result?.plan ? (
                       <pre className="bg-secondary p-6 rounded-xl text-xs overflow-x-auto border border-border">
                         {JSON.stringify(status.result.plan, null, 2)}
                       </pre>
                    ) : <p className="text-secondary italic">Plan will appear here once generated.</p>}
                  </motion.div>
                )}
                
                {activeTab === 'evidence' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-lg font-bold">Researched Evidence</h3>
                    {status?.result?.evidence && status.result.evidence.length > 0 ? (
                      <div className="grid gap-4">
                        {status.result.evidence.map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-secondary/50 border border-border rounded-xl hover:border-accent/50 transition-colors">
                            <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                            <a href={item.url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline block mb-2">{item.url}</a>
                            <p className="text-xs text-secondary line-clamp-2">{item.snippet}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-secondary italic">Evidence will appear here after research phase.</p>}
                  </motion.div>
                )}

                {activeTab === 'logs' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 font-mono">
                    <h3 className="text-lg font-bold font-sans">Process Execution Logs</h3>
                    <div className="bg-black/40 p-6 rounded-xl border border-border space-y-2 h-[500px] overflow-y-auto custom-scrollbar">
                      {status?.logs.map((log, i) => (
                        <div key={i} className="text-xs flex gap-3">
                          <span className="text-secondary opacity-50">[{new Date().toLocaleTimeString()}]</span>
                          <span className="text-accent tracking-widest">INFO</span>
                          <span className="text-foreground/80">{log}</span>
                        </div>
                      ))}
                      {status?.logs.length === 0 && <p className="text-secondary opacity-50">No execution logs yet...</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {status?.result?.final && (
              <div className="p-4 border-t border-border bg-secondary/10 flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download MD
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download Bundle
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
