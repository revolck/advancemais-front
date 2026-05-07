"use client";

import * as React from "react";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  readonly 0: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventLike {
  results: {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

export function useSpeechRecognition(onTranscript: (value: string) => void) {
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    setIsSupported(
      Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
    );

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = React.useCallback(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult?.[0]?.transcript?.trim();
      if (transcript) onTranscript(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [onTranscript]);

  return {
    isSupported,
    isListening,
    start,
    stop,
  };
}
