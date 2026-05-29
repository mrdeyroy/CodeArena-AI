import { create } from 'zustand';

export interface VoiceMessage {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

export interface SpokenMetrics {
  speakingTime: number; // in seconds
  responseLength: number; // word count
  fillerWordsCount: number; // e.g. "um", "like", "ah"
  confidenceScore: number; // 0 to 100
  communicationScore: number; // 0 to 100
  engagementScore: number; // 0 to 100
  speakingSpeed: number; // Words Per Minute
  pausesCount: number;
}

interface VoiceInterviewState {
  isRecording: boolean;
  isMuted: boolean;
  pushToTalkActive: boolean;
  volumeLevel: number; // 0 to 100
  aiSpeakingState: 'listening' | 'thinking' | 'speaking' | 'idle';
  transcript: VoiceMessage[];
  metrics: SpokenMetrics;
  interviewType: string;
  isHybridMode: boolean;
  
  setRecording: (recording: boolean) => void;
  setMuted: (muted: boolean) => void;
  setPushToTalkActive: (active: boolean) => void;
  setVolumeLevel: (level: number) => void;
  setAISpeakingState: (state: 'listening' | 'thinking' | 'speaking' | 'idle') => void;
  addMessage: (speaker: 'interviewer' | 'candidate', text: string) => void;
  updateMetrics: (updates: Partial<SpokenMetrics>) => void;
  setInterviewType: (type: string) => void;
  setHybridMode: (hybrid: boolean) => void;
  resetSession: () => void;
}

const initialMetrics: SpokenMetrics = {
  speakingTime: 0,
  responseLength: 0,
  fillerWordsCount: 0,
  confidenceScore: 80,
  communicationScore: 78,
  engagementScore: 82,
  speakingSpeed: 120, // 120 WPM standard
  pausesCount: 2
};

export const useVoiceInterviewStore = create<VoiceInterviewState>((set) => ({
  isRecording: false,
  isMuted: false,
  pushToTalkActive: false,
  volumeLevel: 0,
  aiSpeakingState: 'idle',
  transcript: [],
  metrics: initialMetrics,
  interviewType: 'DSA',
  isHybridMode: false,

  setRecording: (isRecording) => set({ isRecording }),
  setMuted: (isMuted) => set({ isMuted }),
  setPushToTalkActive: (pushToTalkActive) => set({ pushToTalkActive }),
  setVolumeLevel: (volumeLevel) => set({ volumeLevel }),
  setAISpeakingState: (aiSpeakingState) => set({ aiSpeakingState }),
  
  addMessage: (speaker, text) => set((state) => ({
    transcript: [
      ...state.transcript,
      {
        speaker,
        text,
        timestamp: new Date().toISOString()
      }
    ]
  })),
  
  updateMetrics: (updates) => set((state) => ({
    metrics: { ...state.metrics, ...updates }
  })),
  
  setInterviewType: (interviewType) => set({ interviewType }),
  setHybridMode: (isHybridMode) => set({ isHybridMode }),
  
  resetSession: () => set({
    isRecording: false,
    isMuted: false,
    pushToTalkActive: false,
    volumeLevel: 0,
    aiSpeakingState: 'idle',
    transcript: [],
    metrics: initialMetrics
  })
}));
