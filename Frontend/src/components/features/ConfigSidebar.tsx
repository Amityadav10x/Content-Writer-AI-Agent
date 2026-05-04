import { Send, Loader2, Sparkles, Zap, Brain } from 'lucide-react';

interface ConfigSidebarProps {
  topic: string;
  setTopic: (topic: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ConfigSidebar = ({ topic, setTopic, isGenerating, onGenerate }: ConfigSidebarProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center border border-accent/20">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Config_Panel</h3>
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2 h-[calc(100vh-26rem)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Topic Specification</label>
            <Zap className="w-3 h-3 text-accent animate-pulse" />
          </div>
          <div className="relative group">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g. The future of Agentic AI in 2025..."
              className="w-full h-32 bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all resize-none custom-scrollbar placeholder:text-muted/30"
              disabled={isGenerating}
            />
            <div className="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <span>Engine Parameters</span>
            <span className="text-accent">Auto-Optimize On</span>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Intelligence Level', value: 'High-Fidelity' },
              { label: 'Research Depth', value: 'Deep_Scan' },
              { label: 'Persona Mode', value: 'Expert_Writer' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] font-bold text-muted uppercase">{item.label}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !topic.trim()}
        className={`
          relative mt-8 group overflow-hidden rounded-2xl transition-all duration-500 active:scale-95
          ${isGenerating || !topic.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="absolute inset-0 premium-gradient opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="relative h-14 flex items-center justify-center gap-3 px-6">
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest text-white">Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest text-white">Initialize Engine</span>
              <Send className="w-4 h-4 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </>
          )}
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
