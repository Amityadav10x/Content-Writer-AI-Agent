import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Sparkles, StopCircle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { StreamHandler } from '../../services/streamHandler';
import { blogApi } from '../../services/api';

export const ChatInterface: React.FC = () => {
  const { 
    messages, 
    addMessage, 
    setGenerating, 
    isGenerating, 
    setThreadId, 
    threadId,
    setError
  } = useWorkspaceStore();
  
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamHandlerRef = useRef<StreamHandler | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const currentInput = input;
    setInput('');
    
    // Reset workspace if it's a new conversation (optional)
    // if (!threadId) resetWorkspace();

    addMessage({ role: 'user', content: currentInput, status: 'complete' });
    setGenerating(true);
    addMessage({ role: 'assistant', content: '', status: 'streaming' });

    try {
      const response = await blogApi.generate(currentInput);
      setThreadId(response.job_id);
      
      const handler = new StreamHandler(response.job_id);
      streamHandlerRef.current = handler;
      handler.connect();
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to initialize agent. Please try again.');
      setGenerating(false);
    }
  };

  const handleStop = async () => {
    if (threadId) {
      try {
        await blogApi.cancel(threadId);
        streamHandlerRef.current?.disconnect();
        setGenerating(false);
      } catch (err) {
        console.error('Failed to cancel:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.01] relative">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-12">
            <Sparkles className="w-12 h-12 text-accent mb-6 animate-pulse" />
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Workspace Intelligence</h2>
            <p className="text-sm leading-relaxed max-w-sm">
              Start a new thread to begin deep research, strategic planning, and professional blog synthesis.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                w-10 h-10 rounded-[1.2rem] flex items-center justify-center shrink-0 border border-white/5
                ${msg.role === 'user' ? 'bg-accent/10' : 'bg-white/5'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-accent" /> : <Sparkles className="w-5 h-5 text-white/50" />}
              </div>
              
              <div className={`
                max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed
                ${msg.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none backdrop-blur-xl'}
              `}>
                {msg.content || (msg.status === 'streaming' ? 'Thinking...' : '')}
                {msg.status === 'streaming' && (
                  <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse ml-2" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01] backdrop-blur-3xl">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "Agent is working..." : "What topic should we explore today?"}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 pr-32 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all placeholder:opacity-30"
          />
          
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
            {isGenerating ? (
              <button 
                type="button"
                onClick={handleStop}
                className="flex items-center gap-2 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all h-full"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button 
                type="submit"
                disabled={!input.trim()}
                className="flex items-center gap-2 px-8 premium-gradient rounded-full text-[10px] font-black text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 transition-all h-full"
              >
                <Send className="w-4 h-4" />
                Generate
              </button>
            )}
          </div>
        </form>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-[9px] font-bold text-muted uppercase tracking-[0.2em] opacity-30">
          <span>Tavily Search Optimized</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Gemini 2.0 Flash</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Real-time Workspace</span>
        </div>
      </div>
    </div>
  );
};
