import { useBlogAgent } from './hooks/useBlogAgent';
import { Header } from './components/layout/Header';
import { ConfigSidebar } from './components/features/ConfigSidebar';
import { ActivityFeed } from './components/features/ActivityFeed';
import { OutputViewer } from './components/features/OutputViewer';

export default function App() {
  const {
    topic,
    setTopic,
    isGenerating,
    status,
    handleGenerate,
  } = useBlogAgent();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header status={status} />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Controls & Progress */}
        <aside className="lg:col-span-4 space-y-6">
          <ConfigSidebar 
            topic={topic}
            setTopic={setTopic}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
          
          <ActivityFeed logs={status?.logs || []} />
        </aside>

        {/* Right Content: Output */}
        <div className="lg:col-span-8 space-y-6">
          <OutputViewer 
            status={status}
            isGenerating={isGenerating}
          />
        </div>
      </main>
    </div>
  );
}
