export type SpeechResultCallback = (text: string, isFinal: boolean) => void;
export type SpeechErrorCallback = (error: string) => void;
export type SpeechEventCallback = () => void;

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private continuous: boolean = true;
  private interimResults: boolean = true;
  private language: string = 'en-US';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.language;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(
    onResult: SpeechResultCallback,
    onError?: SpeechErrorCallback,
    onEnd?: SpeechEventCallback
  ) {
    if (!this.isSupported()) {
      if (onError) onError('Speech Recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const resultText = finalTranscript || interimTranscript;
      onResult(resultText, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      if (onError) onError(e.message || 'Failed to start');
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechRecognitionService();
