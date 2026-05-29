'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';
import { Sparkles, BrainCircuit, Mic, Smile } from 'lucide-react';

export const AIAvatar = () => {
  const { aiSpeakingState } = useVoiceInterviewStore();

  const getOverlayLabel = () => {
    switch (aiSpeakingState) {
      case 'speaking': return 'Speaking';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      default: return 'Idle';
    }
  };

  const getBorderColor = () => {
    switch (aiSpeakingState) {
      case 'speaking': return 'border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)]';
      case 'listening': return 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]';
      case 'thinking': return 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)]';
      default: return 'border-slate-800';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
      
      {/* Outer Glow Ring */}
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Circles */}
        {aiSpeakingState === 'speaking' && (
          <>
            <motion.div
              className="absolute w-44 h-44 rounded-full bg-indigo-500/10 border border-indigo-500/30"
              animate={{ scale: [1, 1.4, 1.6], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute w-44 h-44 rounded-full bg-indigo-500/10 border border-indigo-500/30"
              animate={{ scale: [1, 1.3, 1.5], opacity: [0.8, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: 'easeOut' }}
            />
          </>
        )}

        {aiSpeakingState === 'listening' && (
          <motion.div
            className="absolute w-44 h-44 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            animate={{ scale: [1, 1.25, 1.1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        )}

        {/* Core Avatar Sphere */}
        <div className={`w-36 h-36 rounded-full border-2 bg-slate-950 flex flex-col items-center justify-center relative transition-all duration-300 z-10 ${getBorderColor()}`}>
          {aiSpeakingState === 'speaking' && (
            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-indigo-400 flex flex-col items-center gap-1.5"
            >
              <BrainCircuit className="w-10 h-10 animate-pulse" />
              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">SPEAKER</span>
            </motion.div>
          )}

          {aiSpeakingState === 'listening' && (
            <motion.div 
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-emerald-400 flex flex-col items-center gap-1.5"
            >
              <Mic className="w-10 h-10" />
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400">MIC ON</span>
            </motion.div>
          )}

          {aiSpeakingState === 'thinking' && (
            <div className="text-amber-400 flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-amber-500"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest text-amber-500">ANALYZING</span>
            </div>
          )}

          {aiSpeakingState === 'idle' && (
            <div className="text-slate-500 flex flex-col items-center gap-1.5">
              <Smile className="w-10 h-10" />
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">STANDBY</span>
            </div>
          )}
        </div>
      </div>

      {/* Label and Status */}
      <div className="mt-6 text-center space-y-1">
        <h3 className="text-xs font-bold text-slate-200">AI Coach Avatar</h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{getOverlayLabel()}</p>
      </div>

    </div>
  );
};
