import { Header } from './components/layout/Header';
import { ConfigSidebar } from './components/features/ConfigSidebar';
import { ActivityFeed } from './components/features/ActivityFeed';
import { OutputViewer } from './components/features/OutputViewer';
import { GlassCard } from './components/shared/GlassCard';
import { useBlogAgent } from './hooks/useBlogAgent';
import { motion } from 'framer-motion';

function App() {
  const {
    topic,
    setTopic,
    isGenerating,
    status,
    handleGenerate,
  } = useBlogAgent();

  return (
    <div className="min-h-screen flex flex-col selection:bg-accent/30 selection:text-white">
      {/* Dynamic Background Noise/Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 noise-bg" />
      </div>

      <Header status={status} />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 md:p-8 lg:p-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-3 space-y-8">
            <GlassCard className="p-8 h-full min-h-[600px]" delay={0.1}>
              <ConfigSidebar 
                topic={topic} 
                setTopic={setTopic} 
                isGenerating={isGenerating} 
                onGenerate={handleGenerate} 
              />
            </GlassCard>
          </div>

          {/* Center Column: Main Workspace */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <OutputViewer status={status} isGenerating={isGenerating} />
            </motion.div>
          </div>

          {/* Right Column: System Logs / Analytics */}
          <div className="lg:col-span-3 space-y-8">
            <GlassCard className="p-8 h-full min-h-[600px]" delay={0.3}>
              <ActivityFeed logs={status?.logs || []} />
            </GlassCard>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/5 text-center relative z-10">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] opacity-30">
          Powered by Advanced Generative Intelligence
        </p>
      </footer>
    </div>
  );
}

export default App;
