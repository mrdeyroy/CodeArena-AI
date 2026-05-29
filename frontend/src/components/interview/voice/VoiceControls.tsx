'use client';

import * as React from 'react';
import { Mic, MicOff, Square, SkipForward, RotateCcw, Volume2, XOctagon } from 'lucide-react';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';
import { motion } from 'framer-motion';

interface VoiceControlsProps {
  isListening: boolean;
  replayQuestion: () => void;
  skipQuestion: () => void;
  endInterview: () => void;
  onManualTrigger: () => void;
  currentIdx: number;
  totalQuestions: number;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  replayQuestion,
  skipQuestion,
  endInterview,
  onManualTrigger,
  currentIdx,
  totalQuestions
}) => {
  const { isMuted, setMuted, aiSpeakingState } = useVoiceInterviewStore();

  const handleToggleMute = React.useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  // Bind keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in inputs (just in case they are typing text responses)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      if (key === 'm') {
        e.preventDefault();
        handleToggleMute();
      } else if (key === 'r') {
        e.preventDefault();
        replayQuestion();
      } else if (key === 'escape') {
        e.preventDefault();
        endInterview();
      } else if (e.key === ' ' || e.code === 'Space') {
        // Toggle listening mode or submit manual trigger on Space
        e.preventDefault();
        if (aiSpeakingState === 'listening') {
          onManualTrigger();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleToggleMute, replayQuestion, endInterview, onManualTrigger, aiSpeakingState]);

  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl">
      {/* Keyboard Helper Subtext */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold tracking-wider select-none mb-1">
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Space</kbd> Answer / Toggle Mic</span>
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">M</kbd> Mute</span>
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">R</kbd> Replay</span>
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">ESC</kbd> End</span>
      </div>

      <div className="flex items-center justify-between w-full gap-4">
        {/* Replay Button */}
        <button
          onClick={replayQuestion}
          disabled={aiSpeakingState === 'thinking'}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 disabled:opacity-50 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all font-semibold text-xs"
          title="Replay the AI's question (Shortcut: R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay Q</span>
        </button>

        {/* Center: Mute & Main Trigger */}
        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800 text-rose-400'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isMuted ? 'Unmute microphone (Shortcut: M)' : 'Mute microphone (Shortcut: M)'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Main Action Button */}
          <button
            onClick={onManualTrigger}
            disabled={aiSpeakingState === 'thinking' || isMuted}
            className={`relative px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 border shadow-lg ${
              isListening
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-emerald-900/20'
                : aiSpeakingState === 'speaking'
                  ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-700 text-indigo-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-indigo-900/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <Square className="w-4 h-4 fill-white text-white animate-pulse" />
                <span>Submit Response</span>
              </>
            ) : aiSpeakingState === 'speaking' ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>AI Speaking...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Answer Now</span>
              </>
            )}
          </button>
        </div>

        {/* Skip & End Buttons */}
        <div className="flex items-center gap-2">
          {/* Skip Button */}
          <button
            onClick={skipQuestion}
            disabled={currentIdx >= totalQuestions - 1 || aiSpeakingState === 'thinking'}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 disabled:opacity-50 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all font-semibold text-xs"
            title="Skip to next question"
          >
            <span>Skip</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* End Interview Button */}
          <button
            onClick={endInterview}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 transition-all font-semibold text-xs animate-none"
            title="End session (Shortcut: ESC)"
          >
            <XOctagon className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
