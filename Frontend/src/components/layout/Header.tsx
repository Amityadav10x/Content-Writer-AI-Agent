import { Sparkles } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const Header = () => {
  const { isGenerating, activeNode } = useWorkspaceStore();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Blog<span className="text-gradient">Agent</span>
            </h1>
            <p className="text-[10px] font-bold text-muted tracking-[0.2em] uppercase -mt-1 opacity-50">
              Autonomous Content Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
             <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-accent animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
               {isGenerating ? `Processing ${activeNode || 'AI'}` : 'System Ready'}
             </span>
          </div>
          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold transition-all">
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};
