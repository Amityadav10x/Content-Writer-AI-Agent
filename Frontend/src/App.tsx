import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from './components/chat/ChatInterface';
import { ArtifactWorkspace } from './components/workspace/ArtifactWorkspace';
import { ReasoningTimeline } from './components/observability/ReasoningTimeline';
import { Header } from './components/layout/Header';
import { GlassCard } from './components/shared/GlassCard';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { Terminal, History, Plus, AlertCircle } from 'lucide-react';

function App() {
  const { resetWorkspace, threadId, error, setError } = useWorkspaceStore();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-accent/30 selection:text-white">
      {/* Global Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">System Error</p>
                  <p className="text-xs font-bold text-white line-clamp-1">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-white/20 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute inset-0 noise-bg" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header />
      
      <main className="flex-1 flex overflow-hidden relative z-10 p-4 gap-4">
        
        {/* Left Sidebar: Threads & Observability */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[320px] flex flex-col gap-4 shrink-0"
        >
          <GlassCard className="p-4 flex flex-col gap-4">
            <button 
              onClick={() => resetWorkspace()}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all group active:scale-95"
            >
              <Plus className="w-4 h-4 text-accent group-hover:rotate-90 transition-transform" />
              New Intelligence Thread
            </button>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-4 px-2">
                <History className="w-3 h-3 text-muted" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Recent Sessions</span>
              </div>
              
              {threadId ? (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl cursor-default">
                  <p className="text-xs font-bold text-white truncate">Active Research Thread</p>
                  <p className="text-[9px] text-accent font-mono mt-1 opacity-60">{threadId}</p>
                </div>
              ) : (
                <div className="px-3 py-6 border border-dashed border-white/5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tighter italic">No active session</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="flex-1 p-6 overflow-hidden flex flex-col">
            <ReasoningTimeline />
          </GlassCard>
        </motion.div>

        {/* Center: Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-[400px]"
        >
          <GlassCard className="h-full overflow-hidden">
            <ChatInterface />
          </GlassCard>
        </motion.div>

        {/* Right: Artifact Workspace */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[35%] min-w-[500px] shrink-0"
        >
          <ArtifactWorkspace />
        </motion.div>

      </main>

      {/* Footer System Status */}
      <footer className="h-10 border-t border-white/5 px-6 flex items-center justify-between bg-black/40 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Latency: 42ms</span>
        </div>
        
        <div className="flex items-center gap-2 opacity-20 hover:opacity-50 transition-opacity cursor-help">
          <Terminal className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">Kernel v2.1.0-alpha</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
