'use client';

import * as React from 'react';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';
import { Activity, Clock, FileText, AlertTriangle, CheckCircle, BarChart3, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const VoiceMetrics = () => {
  const { metrics } = useVoiceInterviewStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWpmStatus = (wpm: number) => {
    if (wpm === 0) return { label: 'Silent', color: 'text-slate-500 bg-slate-900/50' };
    if (wpm < 100) return { label: 'Slow Pace', color: 'text-amber-400 bg-amber-950/30' };
    if (wpm <= 150) return { label: 'Optimal Pace', color: 'text-emerald-400 bg-emerald-950/30' };
    return { label: 'Fast Pace', color: 'text-rose-400 bg-rose-950/30' };
  };

  const wpmInfo = getWpmStatus(metrics.speakingSpeed);

  return (
    <div className="flex flex-col gap-5 p-5 bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-2xl h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Vocal Analytics</h3>
      </div>

      {/* Main Grid Metrics */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Speaking Duration */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Spoken Time</span>
          </div>
          <span className="text-xl font-black text-slate-200 mt-1 tabular-nums">
            {formatTime(metrics.speakingTime)}
          </span>
        </div>

        {/* Total Words */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Word Count</span>
          </div>
          <span className="text-xl font-black text-slate-200 mt-1 tabular-nums">
            {metrics.responseLength} <span className="text-[10px] text-slate-500 font-medium">words</span>
          </span>
        </div>

        {/* WPM Pace */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tempo (WPM)</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-black text-slate-200 tabular-nums">
              {metrics.speakingSpeed}
            </span>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-transparent select-none ${wpmInfo.color}`}>
              {wpmInfo.label}
            </span>
          </div>
        </div>

        {/* Filler Words */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filler Words</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className={`text-xl font-black tabular-nums ${metrics.fillerWordsCount > 5 ? 'text-amber-400' : 'text-slate-200'}`}>
              {metrics.fillerWordsCount}
            </span>
            {metrics.fillerWordsCount > 5 ? (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-900/30 text-amber-400 bg-amber-950/20 select-none">
                Warning
              </span>
            ) : (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-950/20 select-none">
                Good
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Scores Section */}
      <div className="space-y-4 pt-2 border-t border-slate-800/60">
        {/* Confidence Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Confidence Indicator</span>
            <span className="text-slate-350 font-black tabular-nums">{metrics.confidenceScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.confidenceScore}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Communication Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Fluency & Clarity</span>
            <span className="text-slate-350 font-black tabular-nums">{metrics.communicationScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.communicationScore}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Engagement Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Engagement & Articulation</span>
            <span className="text-slate-350 font-black tabular-nums">{metrics.engagementScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.engagementScore}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Helpful Hint banner */}
      <div className="mt-auto p-3 rounded-xl bg-slate-900/30 border border-slate-800/80 flex items-start gap-2.5">
        <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Coach Feedback</h4>
          <p className="text-[10.5px] text-slate-500 leading-normal font-medium">
            Try to minimize pause filler words like &quot;um&quot;, &quot;like&quot;, and &quot;uh&quot;. Speak steadily at a pace of 110-150 words per minute for professional verbal delivery.
          </p>
        </div>
      </div>
    </div>
  );
};
