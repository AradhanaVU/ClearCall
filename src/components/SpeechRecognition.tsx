import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import './SpeechRecognition.css';

interface SpeechRecognitionProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscriptUpdate: (text: string) => void;
  onInterimUpdate: (text: string) => void;
  theme: Theme;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  isListening,
  onStart,
  onStop,
  onTranscriptUpdate,
  onInterimUpdate,
  theme
}) => {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsSupported(true);
    setIsInitialized(true);
  }, []);

  // Create a new recognition instance when needed
  const createRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

      if (finalTranscript) {
        onTranscriptUpdate(finalTranscript.trim());
        onInterimUpdate('');
      } else if (interimTranscript) {
        onInterimUpdate(interimTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onStop();
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        // Restart with a new instance
        setTimeout(() => {
          if (isListening) {
            const newRecognition = createRecognition();
            recognitionRef.current = newRecognition;
            try {
              newRecognition.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
            }
          }
        }, 100);
      }
    };

    return recognition;
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (isListening) {
      if (!recognitionRef.current) {
        recognitionRef.current = createRecognition();
      }
      
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
        onStop();
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
        recognitionRef.current = null;
      }
    }
  }, [isListening, isInitialized, onStop]);

  const handleStart = async () => {
    if (isStarting) return;
    
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (!isInitialized) {
      setError('Speech recognition is not ready. Please wait a moment and try again.');
      return;
    }
    
    setIsStarting(true);
    setError(null);
    
    try {
      // Check for microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted, starting speech recognition...');
      
      onStart();
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Microphone access is required. Please allow microphone access and try again.');
    } finally {
      setIsStarting(false);
    }
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
          className={`toggle-button ${isListening ? 'listening' : ''} ${isStarting ? 'starting' : ''}`}
          onClick={isListening ? handleStop : handleStart}
          disabled={isStarting}
          style={{
            backgroundColor: isListening ? theme.warningColor : (isStarting ? theme.secondaryColor : theme.buttonColor),
            color: theme.buttonText,
            opacity: isStarting ? 0.7 : 1
          }}
          aria-label={isStarting ? 'Starting recording...' : (isListening ? 'Stop recording' : 'Start recording')}
        >
          <span className="button-icon">
            {isStarting ? '⏳' : (isListening ? '⏹️' : '🎤')}
          </span>
          {isStarting ? 'Starting...' : (isListening ? 'Stop Recording' : 'Start Recording')}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: theme.warningColor }}>
          <p>⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;