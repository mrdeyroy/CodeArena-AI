'use client';

import * as React from 'react';
import { ttsService } from '@/services/interview/tts.service';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsSupported(ttsService.isSupported());
  }, []);

  const speak = React.useCallback((text: string, onEnd?: () => void) => {
    setError(null);
    setIsSpeaking(true);

    ttsService.speak(
      text,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      },
      (err) => {
        setError(err?.message || 'Error occurred during playback.');
        setIsSpeaking(false);
        if (onEnd) onEnd(); // trigger end on error to avoid softlock
      }
    );
  }, []);

  const cancel = React.useCallback(() => {
    ttsService.cancel();
    setIsSpeaking(false);
  }, []);

  React.useEffect(() => {
    return () => {
      ttsService.cancel();
    };
  }, []);

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    cancel
  };
};
