import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Copy, Check, Maximize, Share2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { GlassCard } from '../shared/GlassCard';

export const ArtifactWorkspace: React.FC = () => {
  const { artifactContent, isGenerating, activeNode } = useWorkspaceStore();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifactContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="h-full flex flex-col overflow-hidden border-l border-white/5 bg-black/20 backdrop-blur-3xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Artifact Workspace</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-accent animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                {isGenerating ? `Processing: ${activeNode || 'Agent'}` : 'Live Preview'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar selection:bg-accent/30">
        <AnimatePresence mode="wait">
          {!artifactContent && isGenerating ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-bold text-white/50 uppercase tracking-[0.2em]">Initialising Artifact Stream</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6 text-white/90 border-b border-white/5 pb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-lg leading-relaxed text-white/70 mb-6" {...props} />,
                  li: ({node, ...props}) => <li className="text-white/70 mb-2" {...props} />,
                  code: ({node, ...props}) => <code className="bg-white/5 px-1.5 py-0.5 rounded text-accent font-mono text-sm" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-black/40 border border-white/5 p-6 rounded-2xl my-8 overflow-x-auto" {...props} />,
                  img: ({node, ...props}) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="my-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                    >
                      <img className="w-full h-auto" {...props} />
                    </motion.div>
                  )
                }}
              >
                {artifactContent}
              </ReactMarkdown>
              
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-accent mt-8"
                >
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Streaming intelligence...</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
        <span className="text-[10px] font-mono text-muted uppercase tracking-tighter">
          UTF-8 • Markdown • {artifactContent.split(' ').length} Words
        </span>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
          <Share2 className="w-3 h-3" />
          Publish to Web
        </button>
      </div>
    </GlassCard>
  );
};
