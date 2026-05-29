'use client';

import * as React from 'react';
import { useVoiceInterviewStore, VoiceMessage } from '@/store/voice-interview-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, User, Volume2, Mic } from 'lucide-react';

export const VoiceTranscript = () => {
  const { transcript, isHybridMode } = useVoiceInterviewStore();
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // If not hybrid mode, we don't display the full scrolling overlay, or we display a compact version.
  // Let's implement a toggle or render it beautifully. The design calls for a transcript list.
  return (
    <div className="flex flex-col h-full min-h-[250px] max-h-[400px] rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">Live Dialogue Log</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">
            {isHybridMode ? 'Hybrid Mode Active' : 'Voice Mode'}
          </span>
        </div>
      </div>

      {/* Transcript Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {transcript.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10"
            >
              <Mic className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Awaiting Dialogue</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                The conversation transcript will appear here in real-time as you and the AI speak.
              </p>
            </motion.div>
          ) : (
            transcript.map((msg, index) => {
              const isInterviewer = msg.speaker === 'interviewer';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 items-start ${isInterviewer ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Speaker Icon/Avatar (AI is on Left, Candidate is on Right) */}
                  {isInterviewer && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-850 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm mt-0.5">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs border shadow-md transition-all ${
                      isInterviewer
                        ? 'bg-slate-900/80 border-slate-850 text-slate-200 rounded-tl-sm'
                        : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-100 rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                      {isInterviewer ? (
                        <>
                          <Volume2 className="w-2.5 h-2.5 text-indigo-400" />
                          <span className="text-indigo-400">AI Coach</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-2.5 h-2.5 text-indigo-400" />
                          <span className="text-indigo-300">You (Candidate)</span>
                        </>
                      )}
                      <span className="text-[8px] font-bold text-slate-650 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isInterviewer && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-950/50 border border-indigo-900/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-sm mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
