import { SpokenMetrics } from '@/store/voice-interview-store';

export class VoiceInterviewService {
  private dsaQuestions = [
    "How would you explain the time and space complexity of sorting a linked list versus sorting a dynamic array?",
    "Can you describe how a hash collision occurs, and how you would handle it using open addressing or chaining?",
    "In graph traversal, when would you choose Depth First Search over Breadth First Search?"
  ];

  private systemDesignQuestions = [
    "How would you design a distributed caching layer that prevents cache stampede or thundering herd scenarios?",
    "If you were designing a global chat system like Slack, how would you maintain real-time message synchronization?",
    "Can you explain the trade-offs between choosing SQL versus NoSQL for user payment ledger persistence?"
  ];

  private behavioralQuestions = [
    "Tell me about a time you had a technical disagreement with a teammate. How did you resolve it?",
    "Describe a challenging bug you encountered in production. How did you diagnose and solve it?",
    "How do you stay updated with architectural patterns and optimize your engineering skills?"
  ];

  public getQuestionsForType(type: string): string[] {
    switch (type) {
      case 'System Design':
      case 'SystemDesign': 
        return this.systemDesignQuestions;
      case 'Behavioral': 
        return this.behavioralQuestions;
      default: 
        return this.dsaQuestions;
    }
  }

  public analyzeSpeech(
    text: string,
    timeInSeconds: number,
    prevMetrics: SpokenMetrics
  ): SpokenMetrics {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect filler words (e.g., "like", "um", "uh", "actually", "basically")
    const fillerKeywords = ['um', 'uh', 'like', 'ah', 'basically', 'actually', 'err'];
    let fillerWordsFound = 0;
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord && fillerKeywords.includes(cleanWord)) {
        fillerWordsFound++;
      }
    });

    // Calculate words per minute (WPM)
    const minutes = Math.max(0.1, timeInSeconds / 60);
    const calculatedSpeed = Math.round(wordCount / minutes);
    const wpm = Math.min(220, Math.max(40, calculatedSpeed)); // clamp between 40 and 220

    // Analyze confidence score based on filler word density
    const fillerDensity = wordCount > 0 ? fillerWordsFound / wordCount : 0;
    const confidenceScore = Math.max(50, Math.min(100, Math.round(95 - (fillerDensity * 120))));

    // Analyze communication score based on WPM and length
    let communicationScore = 75;
    if (wpm >= 110 && wpm <= 160) {
      communicationScore += 15; // sweet spot WPM
    } else {
      communicationScore += 5;
    }
    communicationScore = Math.min(100, communicationScore);

    // Engagement score based on length and flow
    const engagementScore = Math.min(100, Math.max(60, Math.round(70 + (wordCount / 5))));

    return {
      speakingTime: prevMetrics.speakingTime + timeInSeconds,
      responseLength: prevMetrics.responseLength + wordCount,
      fillerWordsCount: prevMetrics.fillerWordsCount + fillerWordsFound,
      confidenceScore: Math.round((prevMetrics.confidenceScore + confidenceScore) / 2),
      communicationScore: Math.round((prevMetrics.communicationScore + communicationScore) / 2),
      engagementScore: Math.round((prevMetrics.engagementScore + engagementScore) / 2),
      speakingSpeed: wpm,
      pausesCount: prevMetrics.pausesCount + (text.split(/[.,!?]/).length - 1)
    };
  }
}

export const voiceInterviewService = new VoiceInterviewService();
