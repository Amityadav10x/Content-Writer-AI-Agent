import type { JobStatus } from '../../types/blog';

interface StatusBadgeProps {
  status: JobStatus['status'];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
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
