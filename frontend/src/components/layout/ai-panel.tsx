'use client';

import * as React from 'react';
import { X, Send, Sparkles, User, BrainCircuit } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { AnimatePresence, motion } from 'framer-motion';
import { sendCoachChat } from '@/lib/api';

export const AIPanel = () => {
  const { aiPanelOpen, toggleAIPanel } = useUIStore();
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: "Hello! I am your CodeArena AI Coach. Ask me anything about algorithm optimization, practice path setup, or upcoming tech loops." }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await sendCoachChat(text);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I apologize, but I am having trouble connecting to the backend. Please verify that the FastAPI server is running." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed top-0 right-0 bottom-0 z-40 w-full sm:w-96 bg-slate-900 border-l border-slate-800/80 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/85">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-100">Global AI Coach</span>
            </div>
            <button
              onClick={toggleAIPanel}
              className="p-1.5 hover:bg-slate-800/60 rounded-md text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'DP Learning Plan',
                'Fix my Graph errors',
                'Start Mock Interview'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                  disabled={isTyping}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <div key={index} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                  {isAI && (
                    <div className="w-6 h-6 rounded bg-indigo-650 flex items-center justify-center shrink-0 text-white shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed font-semibold whitespace-pre-wrap shadow-xs
                    ${isAI 
                      ? 'bg-slate-800/90 text-slate-200 border border-slate-700/40' 
                      : 'bg-indigo-600 text-white'}`}
                  >
                    {msg.text}
                  </div>
                  {!isAI && (
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-slate-350 font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded bg-indigo-650 flex items-center justify-center text-white shrink-0 text-[10px] animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/40 rounded-lg px-3 py-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                  Coach is typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder={isTyping ? "Waiting for coach..." : "Ask your AI Coach..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                disabled={isTyping}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
