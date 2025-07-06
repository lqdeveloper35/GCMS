import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript definitions for the Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
}

declare let window: Window;

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const listeningRef = useRef(false);

    useEffect(() => {
        listeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onResult(finalTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
             if (listeningRef.current) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return;
        
        const currentlyListening = listeningRef.current;
        if (currentlyListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start recognition", e)
            }
        }
    },[]);

    return {
        isListening,
        toggleListening,
        hasRecognitionSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    };
};