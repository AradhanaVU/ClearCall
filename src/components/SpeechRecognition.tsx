import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../types';
import './SpeechRecognition.css';

interface SpeechRecognitionProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscriptUpdate: (text: string) => void;
  theme: Theme;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  isListening,
  onStart,
  onStop,
  onTranscriptUpdate,
  theme
}) => {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition settings
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    // Handle successful recognition
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Only process final results to avoid spam
      if (finalTranscript) {
        onTranscriptUpdate(finalTranscript.trim());
      }
    };

    // Handle errors
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'no-speech':
          console.log('⚠️ No speech detected, continuing...');
          // Don't stop for no-speech, just continue
          return;
        case 'audio-capture':
          setError('Microphone not accessible. Please check your permissions.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'network':
          setError('Network error. Please check your internet connection.');
          break;
        case 'aborted':
          console.log('⚠️ Speech recognition aborted, continuing...');
          // Don't stop for aborted, just continue
          return;
        default:
          console.log(`⚠️ Speech recognition error: ${event.error}, continuing...`);
          // Don't stop for other errors, just log and continue
          return;
      }
      
      onStop();
    };

    // Handle end of recognition
    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ended, isListening:', isListening);
      isStartingRef.current = false;
      isStoppingRef.current = false;
      
      if (isListening) {
        // Restart recognition if it was supposed to be listening
        setTimeout(() => {
          if (isListening && recognitionRef.current && !isStartingRef.current) {
            try {
              console.log('🔄 Restarting speech recognition...');
              isStartingRef.current = true;
              recognitionRef.current.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
              isStartingRef.current = false;
              // If restart fails, stop listening to prevent infinite loops
              onStop();
            }
          }
        }, 100);
      }
    };

    setIsInitialized(true);
  }, [onTranscriptUpdate, onStop, isListening]);

  useEffect(() => {
    if (!isInitialized || !recognitionRef.current) return;

    if (isListening) {
      if (!isStartingRef.current) {
        try {
          setError(null);
          console.log('🎤 Starting speech recognition...');
          isStartingRef.current = true;
          recognitionRef.current.start();
        } catch (err) {
          console.error('Error starting recognition:', err);
          isStartingRef.current = false;
          setError('Failed to start speech recognition. Please try again.');
          onStop();
        }
      }
    } else {
      if (!isStoppingRef.current) {
        try {
          console.log('🛑 Stopping speech recognition...');
          isStoppingRef.current = true;
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
          isStoppingRef.current = false;
        }
      }
    }
  }, [isListening, isInitialized, onStop]);

  const handleStart = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    onStart();
  };

  const handleStop = () => {
    onStop();
  };

  if (!isSupported) {
    return (
      <div className="speech-recognition-error" style={{ color: theme.warningColor }}>
        <p>Speech recognition is not supported in this browser.</p>
        <p>Please use Chrome, Edge, or Safari for the best experience.</p>
      </div>
    );
  }

  return (
    <div className="speech-recognition">
      <div className="recognition-controls">
        <button
          className={`start-button ${isListening ? 'listening' : ''}`}
          onClick={handleStart}
          disabled={isListening}
          style={{
            backgroundColor: isListening ? theme.warningColor : '#28a745',
            color: theme.buttonText,
            opacity: isListening ? 0.7 : 1
          }}
          aria-label={isListening ? 'Currently listening' : 'Start listening'}
        >
          {isListening ? '🎤 Listening...' : '🎤 Start Listening'}
        </button>
        
        <button
          className="stop-button"
          onClick={handleStop}
          disabled={!isListening}
          style={{
            backgroundColor: theme.buttonColor,
            color: theme.buttonText,
            opacity: !isListening ? 0.5 : 1
          }}
          aria-label="Stop listening"
        >
          ⏹️ Stop
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: theme.warningColor }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="recognition-status">
        <p style={{ color: theme.textColor }}>
          {isListening ? '🎧 Listening for speech...' : '⏸️ Not listening'}
        </p>
        <p className="status-hint" style={{ color: theme.textColor, opacity: 0.7 }}>
          {isListening 
            ? 'Speak clearly into your microphone. Click Stop when finished.' 
            : 'Click Start to begin transcribing speech in real-time.'
          }
        </p>
      </div>
    </div>
  );
};

export default SpeechRecognition;
