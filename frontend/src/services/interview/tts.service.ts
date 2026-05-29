export type TTSCallback = () => void;

export class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public speak(
    text: string,
    onStart?: TTSCallback,
    onEnd?: TTSCallback,
    onError?: (err: any) => void
  ) {
    if (!this.isSupported() || !this.synth) {
      if (onError) onError('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel active synthesis
    this.cancel();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set a natural-sounding English voice
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find((v) => v.lang.startsWith('en-'));
    
    if (englishVoice) {
      this.currentUtterance.voice = englishVoice;
    }

    this.currentUtterance.rate = 1.0; // standard speed
    this.currentUtterance.pitch = 1.0;

    if (onStart) {
      this.currentUtterance.onstart = () => onStart();
    }

    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance.onerror = (err) => {
      console.error('TTS execution error:', err);
      this.currentUtterance = null;
      if (onError) onError(err);
    };

    this.synth.speak(this.currentUtterance);
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const ttsService = new TTSService();
