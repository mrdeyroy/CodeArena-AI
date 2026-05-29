'use client';

import * as React from 'react';
import { useVoiceInterviewStore } from '@/store/voice-interview-store';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useTextToSpeech } from './useTextToSpeech';
import { voiceInterviewService } from '@/services/interview/voiceInterview.service';

export const useVoiceInterview = () => {
  const store = useVoiceInterviewStore();
  const speech = useSpeechRecognition();
  const tts = useTextToSpeech();

  const [questions, setQuestions] = React.useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [questionStartTime, setQuestionStartTime] = React.useState<number>(0);

  // Initialize questions list
  React.useEffect(() => {
    const list = voiceInterviewService.getQuestionsForType(store.interviewType);
    setQuestions(list);
    setCurrentIdx(0);
  }, [store.interviewType]);

  const handleNextInterviewerQuestion = React.useCallback((questionText: string) => {
    store.setAISpeakingState('speaking');
    store.addMessage('interviewer', questionText);
    
    // Play synthesis
    tts.speak(questionText, () => {
      // Start listening when AI stops speaking
      store.setAISpeakingState('listening');
      setQuestionStartTime(Date.now());
      
      if (!store.isMuted) {
        speech.startListening((candidateText) => {
          // Trigger when speech stops speaking
          handleProcessCandidateResponse(candidateText);
        });
      }
    });
  }, [tts, speech, store]);

  const startInterview = React.useCallback(() => {
    store.resetSession();
    setCurrentIdx(0);
    const list = voiceInterviewService.getQuestionsForType(store.interviewType);
    if (list.length > 0) {
      handleNextInterviewerQuestion(list[0]);
    }
  }, [store, handleNextInterviewerQuestion]);

  const handleProcessCandidateResponse = React.useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Stop recording and show thinking state
    speech.stopListening();
    store.setAISpeakingState('thinking');
    store.addMessage('candidate', text);

    // Calculate metrics
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const nextMetrics = voiceInterviewService.analyzeSpeech(text, elapsedSeconds, store.metrics);
    store.updateMetrics(nextMetrics);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Next step
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      handleNextInterviewerQuestion(questions[nextIdx]);
    } else {
      // End interview session
      store.setAISpeakingState('idle');
      speech.stopListening();
    }
  }, [speech, store, currentIdx, questions, questionStartTime, handleNextInterviewerQuestion]);

  const replayQuestion = React.useCallback(() => {
    if (questions[currentIdx]) {
      tts.cancel();
      speech.stopListening();
      handleNextInterviewerQuestion(questions[currentIdx]);
    }
  }, [questions, currentIdx, tts, speech, handleNextInterviewerQuestion]);

  const skipQuestion = React.useCallback(() => {
    tts.cancel();
    speech.stopListening();
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      handleNextInterviewerQuestion(questions[nextIdx]);
    } else {
      store.setAISpeakingState('idle');
    }
  }, [questions, currentIdx, tts, speech, handleNextInterviewerQuestion, store]);

  const endInterview = React.useCallback(() => {
    tts.cancel();
    speech.stopListening();
    store.resetSession();
  }, [tts, speech, store]);

  return {
    currentQuestion: questions[currentIdx] || '',
    currentIdx,
    totalQuestions: questions.length,
    speechText: speech.transcript,
    isSpeechListening: speech.isListening,
    startInterview,
    replayQuestion,
    skipQuestion,
    endInterview,
    submitManualText: handleProcessCandidateResponse
  };
};
