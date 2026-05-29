'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';

export const SpeechIndicator = () => {
  const { aiSpeakingState, isMuted } = useVoiceInterviewStore();
  const barCount = 12;

  // Define scale/amplitude ranges for each state
  const getAnimationConfig = (index: number) => {
    if (isMuted) {
      return {
        height: ['8px', '8px'],
        transition: { duration: 1 }
      };
    }

    switch (aiSpeakingState) {
      case 'listening': // Candidate is speaking
        return {
          height: ['8px', `${12 + Math.random() * 32}px`, '8px'],
          transition: {
            repeat: Infinity,
            duration: 0.5 + Math.random() * 0.5,
            ease: 'easeInOut' as const,
            delay: index * 0.05,
          }
        };
      case 'speaking': // AI is speaking
        return {
          height: ['8px', `${10 + Math.sin(index) * 16}px`, '8px'],
          transition: {
            repeat: Infinity,
            duration: 0.8,
            ease: 'easeInOut' as const,
            delay: index * 0.03,
          }
        };
      case 'thinking': // AI is processing
        return {
          height: ['8px', '14px', '8px'],
          transition: {
            repeat: Infinity,
            duration: 1.2,
            ease: 'easeInOut' as const,
            delay: (index % 4) * 0.2,
          }
        };
      case 'idle':
      default:
        return {
          height: ['8px', '8px'],
          transition: { duration: 1 }
        };
    }
  };

  const getBarColor = () => {
    if (isMuted) return 'bg-slate-700';
    switch (aiSpeakingState) {
      case 'listening':
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
      case 'speaking':
        return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]';
      case 'thinking':
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 h-12 px-4 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 w-fit mx-auto min-w-[140px]">
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mr-2 select-none">
        {isMuted ? 'Muted' : aiSpeakingState === 'listening' ? 'User Mic' : 'Audio'}
      </span>
      <div className="flex items-center justify-center gap-1 h-10 w-24">
        {Array.from({ length: barCount }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${getBarColor()} transition-colors duration-300`}
            animate={getAnimationConfig(i)}
          />
        ))}
      </div>
    </div>
  );
};
