import { Sparkles } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import type { JobStatus } from '../../types/blog';

interface HeaderProps {
  status: JobStatus | null;
}

export const Header = ({ status }: HeaderProps) => {
  return (
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
  );
};
