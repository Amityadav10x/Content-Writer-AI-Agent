import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Download, Check, Copy, Terminal, Sparkles, Search, Map, Layers } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (status?.result?.final) {
      navigator.clipboard.writeText(status.result.final);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: 'preview', label: 'Preview', icon: FileText },
    { id: 'plan', label: 'Research & Plan', icon: Map },
    { id: 'evidence', label: 'Evidence', icon: Layers, count: status?.result?.evidence?.length },
    { id: 'logs', label: 'System Trace', icon: Terminal, count: status?.logs?.length },
  ];

  if (!status && !isGenerating) {
    return (
      <GlassCard className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-accent/5 rounded-[2.5rem] flex items-center justify-center mb-8 relative group">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-accent/10 rounded-[2.5rem] blur-2xl group-hover:bg-accent/20 transition-colors"
          />
          <Sparkles className="w-10 h-10 text-accent relative z-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4">Initialize Intelligence</h2>
        <p className="text-muted max-w-sm mx-auto leading-relaxed text-sm">
          Awaiting instructions. Enter a topic in the configuration panel to begin the deep research and synthesis process.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-md overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 relative overflow-hidden whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'text-muted hover:text-white hover:bg-white/[0.05]'}
              `}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? 'animate-pulse' : 'opacity-50'}`} />
              <span className="relative z-10 uppercase tracking-[0.15em]">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'preview' && status?.result?.final && (
          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl text-xs font-bold transition-all group active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted group-hover:text-white" />}
              <span className="uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 premium-gradient rounded-xl text-xs font-black text-white shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" />
              <span className="uppercase tracking-widest">Export PDF</span>
            </button>
          </div>
        )}
      </div>

      <GlassCard className="h-[calc(100vh-18rem)] overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (status?.status || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto"
            >
              {activeTab === 'preview' && (
                status?.result?.final ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {status.result.final}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-2 border-accent/20 border-t-accent rounded-full"
                      />
                      <Loader2 className="w-6 h-6 text-accent animate-spin absolute top-1/2 left-1/2 -mt-3 -ml-3" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2 tracking-tight">Synthesizing Narrative</p>
                    <p className="text-muted text-sm italic">Our intelligence engine is weaving the researched data into a final blog post...</p>
                  </div>
                )
              )}

              {activeTab === 'plan' && (
                <div className="space-y-12 py-4">
                  {/* Research Section */}
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Search className="w-4 h-4 text-accent" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Research Protocol</h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    
                    {status?.result?.queries ? (
                      <div className="grid gap-3">
                        {status.result.queries.map((q: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                            <span className="text-[10px] font-black text-muted group-hover:text-accent transition-colors">QUERY_0{i+1}</span>
                            <p className="text-sm font-mono text-foreground/80">{q}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-white/10 rounded-3xl text-center opacity-30 italic text-sm">
                        Waiting for research initialization...
                      </div>
                    )}
                  </section>

                  {/* Strategic Plan Section */}
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Map className="w-4 h-4 text-accent" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Strategic Protocol</h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    {status?.result?.plan ? (
                      <div className="grid gap-6">
                        {status.result.plan.tasks?.map((task: any, i: number) => (
                          <div key={i} className="group p-8 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-accent/10 group-hover:text-accent/30 transition-colors">0{i + 1}</span>
                                <div>
                                  <h4 className="text-lg font-black text-white group-hover:text-accent transition-colors">{task.title}</h4>
                                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{task.goal}</p>
                                </div>
                              </div>
                              <div className="px-3 py-1 bg-accent/10 rounded-full border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">
                                {task.target_words} Words
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              {task.bullets?.map((bullet: string, j: number) => (
                                <div key={j} className="flex gap-3 text-sm text-muted/80 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                                  {bullet}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-white/10 rounded-3xl text-center opacity-30 italic text-sm">
                        Waiting for strategy synthesis...
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="grid gap-6 py-4">
                  {status?.result?.evidence && status.result.evidence.length > 0 ? (
                    status.result.evidence.map((item: any, i: number) => (
                      <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group block p-8 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 transition-all hover:-translate-y-1 active:scale-[0.99]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors leading-tight pr-8">{item.title}</h4>
                          <div className="px-2 py-1 rounded bg-accent/10 border border-accent/20 text-[8px] font-black uppercase tracking-widest text-accent">
                            Verified Source
                          </div>
                        </div>
                        <p className="text-sm text-muted line-clamp-3 leading-relaxed mb-6">{item.snippet}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all">
                          <Search className="w-3 h-3" />
                          <span>Review Full Source Data</span>
                          <div className="h-[1px] flex-1 bg-white/10" />
                          <span>View Detail →</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center grayscale">
                      <Layers className="w-12 h-12 mb-6" />
                      <p className="text-xl font-black uppercase tracking-widest">Harvesting Empirical Data</p>
                      <p className="text-sm italic mt-2">Connecting to verified intelligence sources...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                      <Terminal className="w-3 h-3" />
                      <span>Live Intelligence Stream</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-[11px] leading-loose custom-scrollbar h-[500px] overflow-y-auto">
                    {status?.logs?.map((log, i) => (
                      <div key={i} className="flex gap-4 group hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors">
                        <span className="text-muted/30 whitespace-nowrap">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                        <span className="text-accent/50 font-bold">INFO</span>
                        <span className="text-foreground/70 group-hover:text-foreground transition-colors">{log}</span>
                      </div>
                    ))}
                    {!status?.logs?.length && (
                      <p className="text-muted/30 italic">No execution trace detected...</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
};
