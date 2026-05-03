import { Send, Loader2 } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';

interface ConfigSidebarProps {
  topic: string;
  setTopic: (topic: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ConfigSidebar = ({ topic, setTopic, isGenerating, onGenerate }: ConfigSidebarProps) => {
  return (
    <GlassCard className="p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Configuration</h2>
      <div className="space-y-2">
        <label className="text-xs text-secondary font-medium">Topic or Prompt</label>
        <textarea 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What should the blog be about?"
          className="w-full h-32 bg-secondary border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>
      <button 
        onClick={onGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        {isGenerating ? 'Generating...' : 'Start Generation'}
      </button>
    </GlassCard>
  );
};
