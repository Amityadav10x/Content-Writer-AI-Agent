import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Map, PenTool, Layers, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useWorkspaceStore, type ExecutionNode } from '../../store/useWorkspaceStore';

export const ReasoningTimeline: React.FC = () => {
  const { nodes, activeNode } = useWorkspaceStore();

  const getNodeIcon = (id: string, status: ExecutionNode['status']) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === 'running') return <Circle className="w-4 h-4 text-accent animate-spin" />;

    switch (id) {
      case 'router': return <Brain className="w-4 h-4" />;
      case 'research': return <Search className="w-4 h-4" />;
      case 'orchestrator': return <Map className="w-4 h-4" />;
      case 'worker': return <PenTool className="w-4 h-4" />;
      case 'reducer': return <Layers className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Agent Orchestration</h3>
        {activeNode && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">Active: {activeNode}</span>
          </motion.div>
        )}
      </div>

      <div className="relative space-y-2">
        {/* Connection Line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-[1px] bg-white/5" />

        {Object.values(nodes).map((node, index) => (
          <motion.div 
            key={node.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative flex items-center gap-4 p-3 rounded-xl transition-all duration-500
              ${node.status === 'running' ? 'bg-accent/5 border border-accent/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]' : 'bg-transparent border border-transparent'}
              ${node.status === 'completed' ? 'opacity-100' : 'opacity-40'}
            `}
          >
            <div className={`
              w-9 h-9 rounded-lg flex items-center justify-center relative z-10 transition-colors
              ${node.status === 'running' ? 'bg-accent text-white' : 'bg-white/5 text-muted'}
              ${node.status === 'completed' ? 'bg-green-500/10 text-green-500' : ''}
            `}>
              {getNodeIcon(node.id, node.status)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold tracking-tight transition-colors ${node.status === 'running' ? 'text-white' : 'text-muted'}`}>
                  {node.label}
                </span>
                {node.startTime && (
                  <span className="text-[9px] font-mono opacity-30">
                    {node.endTime ? `${((node.endTime - node.startTime) / 1000).toFixed(1)}s` : '...'}
                  </span>
                )}
              </div>
              <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                <AnimatePresence>
                  {node.status === 'running' && (
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: "linear" }}
                      className="h-full bg-accent"
                    />
                  )}
                  {node.status === 'completed' && (
                    <div className="h-full bg-green-500 w-full" />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
