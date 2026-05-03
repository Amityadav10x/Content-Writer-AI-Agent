import { Terminal, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityFeedProps {
  logs: string[];
}

export const ActivityFeed = ({ logs }: ActivityFeedProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Terminal className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">System Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-md border border-green-500/20">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {logs.length > 0 ? (
            [...logs].reverse().map((log, i) => (
              <motion.div
                key={logs.length - i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/5 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-muted/50 font-mono">
                    {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-black text-muted uppercase tracking-tighter group-hover:text-accent transition-colors">
                    Log_Trace
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/80 font-medium line-clamp-2">
                  {log}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-3 grayscale">
              <Activity className="w-8 h-8" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Pulse</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-3 h-3 text-muted" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Engine</span>
            </div>
            <p className="text-xs font-black text-white tracking-tight">GEMINI-1.5-PRO</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-muted" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Uptime</span>
            </div>
            <p className="text-xs font-black text-white tracking-tight">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
