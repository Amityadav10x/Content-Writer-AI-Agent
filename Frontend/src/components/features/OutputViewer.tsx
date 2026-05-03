import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlassCard } from '../shared/GlassCard';
import type { JobStatus } from '../../types/blog';

interface OutputViewerProps {
  status: JobStatus | null;
  isGenerating: boolean;
}

type TabType = 'preview' | 'plan' | 'evidence' | 'logs';

export const OutputViewer = ({ status, isGenerating }: OutputViewerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  const tabs: TabType[] = ['preview', 'plan', 'evidence', 'logs'];

  return (
    <GlassCard className="overflow-hidden flex flex-col h-[750px]">
      {/* Tabs */}
      <div className="flex border-b border-border bg-secondary/30">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
              key="preview"
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
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-bold">Generation Plan</h3>
              {status?.result?.plan ? (
                 <pre className="bg-secondary p-6 rounded-xl text-xs overflow-x-auto border border-border">
                   {JSON.stringify(status.result.plan, null, 2)}
                 </pre>
              ) : <p className="text-secondary italic">Plan will appear here once generated.</p>}
            </motion.div>
          )}
          
          {activeTab === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-bold">Researched Evidence</h3>
              {status?.result?.evidence && status.result.evidence.length > 0 ? (
                <div className="grid gap-4">
                  {status.result.evidence.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-secondary/50 border border-border rounded-xl hover:border-accent/50 transition-colors">
                      <h4 className="font-semibold text-sm mb-1">{item?.title || 'Untitled'}</h4>
                      <a href={item?.url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline block mb-2">{item?.url}</a>
                      <p className="text-xs text-secondary line-clamp-2">{item?.snippet}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-secondary italic">Evidence will appear here after research phase.</p>}
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 font-mono">
              <h3 className="text-lg font-bold font-sans">Process Execution Logs</h3>
              <div className="bg-black/40 p-6 rounded-xl border border-border space-y-2 h-[500px] overflow-y-auto custom-scrollbar">
                {status?.logs?.map((log, i) => (
                  <div key={i} className="text-xs flex gap-3">
                    <span className="text-secondary opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-accent tracking-widest">INFO</span>
                    <span className="text-foreground/80">{log}</span>
                  </div>
                ))}
                {(!status?.logs || status.logs.length === 0) && <p className="text-secondary opacity-50">No execution logs yet...</p>}
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
    </GlassCard>
  );
};
