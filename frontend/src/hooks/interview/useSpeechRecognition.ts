'use client';

import * as React from 'react';
import { speechService } from '@/services/interview/speech.service';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    setIsSupported(speechService.isSupported());
  }, []);

  const startListening = React.useCallback((onFinalResult?: (text: string) => void) => {
    setError(null);
    setTranscript('');
    setIsListening(true);

    speechService.start(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal && onFinalResult) {
          onFinalResult(text);
        }
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  }, []);

  const stopListening = React.useCallback(() => {
    speechService.stop();
    setIsListening(false);
  }, []);

  React.useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  return {
    transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening
  };
};
