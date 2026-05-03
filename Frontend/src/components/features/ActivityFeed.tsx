import { Terminal } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';

interface ActivityFeedProps {
  logs: string[];
}

export const ActivityFeed = ({ logs }: ActivityFeedProps) => {
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Live Progress</h2>
        <Terminal className="w-4 h-4 text-secondary" />
      </div>
      <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar pr-2">
        {logs.length === 0 && <p className="text-xs text-secondary italic">Waiting for process to start...</p>}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 text-xs">
            <span className="text-accent">→</span>
            <p className="text-foreground/80 line-clamp-2">{log}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
