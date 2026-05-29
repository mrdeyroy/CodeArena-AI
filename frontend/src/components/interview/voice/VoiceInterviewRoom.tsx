'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useVoiceInterview } from '@/hooks/interview/useVoiceInterview';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';
import { AIAvatar } from './AIAvatar';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceControls } from './VoiceControls';
import { VoiceTranscript } from './VoiceTranscript';
import { VoiceMetrics } from './VoiceMetrics';
import { SpeechIndicator } from './SpeechIndicator';
import { ArrowLeft, Brain, Sparkles, Video, HelpCircle, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceInterviewRoom = () => {
  const router = useRouter();
  const store = useVoiceInterviewStore();
  const {
    currentQuestion,
    currentIdx,
    totalQuestions,
    speechText,
    isSpeechListening,
    startInterview,
    replayQuestion,
    skipQuestion,
    endInterview,
    submitManualText
  } = useVoiceInterview();

  const [activeSession, setActiveSession] = React.useState(false);
  const [hybridTypeInput, setHybridTypeInput] = React.useState(false);

  const handleStartSession = () => {
    store.setHybridMode(hybridTypeInput);
    startInterview();
    setActiveSession(true);
  };

  const handleExitSession = () => {
    endInterview();
    setActiveSession(false);
    router.push('/interview');
  };

  const handleManualSubmit = () => {
    if (isSpeechListening) {
      submitManualText(speechText || '(No transcript received)');
    }
  };

  const getTopicLabel = () => {
    switch (store.interviewType) {
      case 'DSA': return 'Data Structures & Algorithms';
      case 'SystemDesign': return 'System Design & Architecture';
      case 'Behavioral': return 'Behavioral & Leadership';
      default: return store.interviewType;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitSession}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Return to mock interview catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded">AI Mock Room</span>
              {activeSession && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              )}
            </div>
            <h1 className="text-sm font-bold text-slate-200 mt-0.5">CodeArena Voice Assistant</h1>
          </div>
        </div>

        {activeSession && (
          <div className="flex items-center gap-4">
            {/* Progress counter */}
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</p>
              <p className="text-xs font-black text-slate-350 tabular-nums">Question {currentIdx + 1} of {totalQuestions}</p>
            </div>
            {/* Progress bar */}
            <div className="w-24 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!activeSession ? (
            /* Entry Setup Card */
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="text-center space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-indigo-400 mx-auto">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight">AI Voice Interview Prep</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                  Practice vocal communication, structural reasoning, and technical fluency under pressure. Our AI Coach speaks questions aloud and grades your clarity, timing, and filler word frequency.
                </p>
              </div>

              {/* Topic Select */}
              <div className="mt-8 space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Choose Practice Topic</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'DSA', label: 'Algorithms' },
                      { id: 'SystemDesign', label: 'Systems' },
                      { id: 'Behavioral', label: 'Behavioral' }
                    ].map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => store.setInterviewType(topic.id)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          store.interviewType === topic.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                            : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hybrid mode toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">Show Dialog Overlay</span>
                      <span className="text-[8px] font-black uppercase bg-slate-900 border border-slate-800 text-indigo-400 px-1.5 py-0.5 rounded">Hybrid</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-xs font-medium">
                      Provides real-time scrolling subtitles of your speaking transcripts and the AI Coach queries.
                    </p>
                  </div>
                  <button
                    onClick={() => setHybridTypeInput(!hybridTypeInput)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      hybridTypeInput ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        hybridTypeInput ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Hardware Check Note */}
                <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-850 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Please ensure your headset or microphone is connected. Chrome, Edge, or Safari are recommended for the best Speech Recognition API accuracy.
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={handleStartSession}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/30 border border-indigo-500 transition-all"
                >
                  Enter Voice Interview Room
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Voice Room Dashboard Grid */
            <motion.div
              key="room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col lg:flex-row gap-6 items-stretch"
            >
              {/* Left Column: Avatar & Camera Feed */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                {/* AI Coach Avatar Panel */}
                <div className="flex-1 bg-slate-950/30 border border-slate-900 rounded-3xl overflow-hidden shadow-md flex items-center justify-center min-h-[300px]">
                  <AIAvatar />
                </div>

                {/* Camera Feed Panel */}
                <div className="h-[260px] relative">
                  <VoiceRecorder />
                </div>
              </div>

              {/* Center Column: Question display, visual waveforms, subtitles/dialogue and controls */}
              <div className="flex-1 flex flex-col gap-6 justify-between">
                
                {/* Question and Interactive Screen */}
                <div className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900/40 border border-slate-900 rounded-3xl p-5 md:p-6 shadow-md flex flex-col justify-between min-h-[300px]">
                  {/* Card Header metadata */}
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-wider mb-4 border-b border-slate-900 pb-3">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                      {getTopicLabel()}
                    </span>
                    <span className="text-slate-400">
                      Q{currentIdx + 1}
                    </span>
                  </div>

                  {/* Large Speaking Question Text */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-6">
                    <AnimatePresence mode="wait">
                      {currentQuestion ? (
                        <motion.h2
                          key={currentQuestion}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-lg md:text-xl font-bold leading-relaxed text-slate-200 tracking-tight max-w-xl"
                        >
                          {currentQuestion}
                        </motion.h2>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-slate-500 font-bold uppercase tracking-wider animate-pulse text-xs"
                        >
                          Session Complete. Calculating final metrics...
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Speech Transcript Subtitle Overlay */}
                    {isSpeechListening && speechText && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold italic text-emerald-400 max-w-md shadow-sm"
                      >
                        &ldquo;{speechText}&rdquo;
                      </motion.div>
                    )}
                  </div>

                  {/* Interactive Wavelines Visualizer */}
                  <div className="mt-4">
                    <SpeechIndicator />
                  </div>
                </div>

                {/* Subtitle Dialogue list (visible always if HybridMode, or scrollable at bottom) */}
                {store.isHybridMode && (
                  <div className="h-[220px]">
                    <VoiceTranscript />
                  </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="w-full">
                  <VoiceControls
                    isListening={isSpeechListening}
                    replayQuestion={replayQuestion}
                    skipQuestion={skipQuestion}
                    endInterview={handleExitSession}
                    onManualTrigger={handleManualSubmit}
                    currentIdx={currentIdx}
                    totalQuestions={totalQuestions}
                  />
                </div>
              </div>

              {/* Right Column: Live Spoken Metrics */}
              <div className="w-full lg:w-1/3 flex flex-col">
                <VoiceMetrics />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
