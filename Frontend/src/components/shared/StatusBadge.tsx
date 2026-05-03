import type { JobStatus } from '../../types/blog';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: JobStatus['status'];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const configs = {
    starting: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Initializing', pulse: true },
    running: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing', pulse: true },
    completed: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Ready', pulse: false },
    failed: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error', pulse: false },
  };

  const config = configs[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5 ${config.bg} ${config.color}`}>
      {config.pulse && (
        <motion.span 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')}`} 
        />
      )}
      {config.label}
    </div>
  );
};
