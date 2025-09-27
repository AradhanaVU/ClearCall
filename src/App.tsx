import React, { useState, useEffect, useCallback } from 'react';
import { TranscriptEntry, ScamKeyword, Theme, CallLogEntry } from './types';
import SpeechRecognition from './components/SpeechRecognition';
import CaptionDisplay from './components/CaptionDisplay';
import GeminiInsights from './components/GeminiInsights';
import { ScamDetector } from './utils/ScamDetector';
import ThemeToggle from './components/ThemeToggle';
import CallLog from './components/CallLog';
import { themes } from './utils/themes';
import { scamKeywords } from './utils/scamKeywords';
import { geminiService } from './services/geminiService';
import './App.css';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [showCallLog, setShowCallLog] = useState(false);
  const [showGeminiInsights, setShowGeminiInsights] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);

  // Initialize call log from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('clearcall-logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          startTime: new Date(log.startTime),
          endTime: new Date(log.endTime),
          transcript: log.transcript.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
        }));
        setCallLogs(parsedLogs);
      } catch (error) {
        console.error('Error loading call logs:', error);
      }
    }
  }, []);

  // Save call logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clearcall-logs', JSON.stringify(callLogs));
  }, [callLogs]);

  const handleTranscriptUpdate = useCallback(async (newText: string) => {
    const scamDetection = ScamDetector.detectScamKeywords(newText, scamKeywords);
    
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      text: newText,
      timestamp: new Date(),
      isScamWarning: scamDetection.hasScamKeywords,
      scamKeywords: scamDetection.keywords
    };

    setTranscript(prev => [...prev, newEntry]);

    // Send to Gemini for enhanced analysis if connected
    if (geminiConnected && showGeminiInsights) {
      try {
        await geminiService.analyzeText(newText);
      } catch (error) {
        console.error('Gemini analysis error:', error);
      }
    }
  }, [geminiConnected, showGeminiInsights]);

  const startCall = useCallback(() => {
    const callId = Date.now().toString();
    setCurrentCallId(callId);
    setTranscript([]);
    setIsListening(true);
  }, []);

  const endCall = useCallback(() => {
    if (currentCallId && transcript.length > 0) {
      const totalScamWarnings = transcript.filter(entry => entry.isScamWarning).length;
      
      const callLogEntry: CallLogEntry = {
        id: currentCallId,
        startTime: transcript[0]?.timestamp || new Date(),
        endTime: new Date(),
        transcript: [...transcript],
        totalScamWarnings
      };

      setCallLogs(prev => [callLogEntry, ...prev]);
    }
    
    setIsListening(false);
    setCurrentCallId(null);
  }, [currentCallId, transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme(prev => 
      prev.name === 'light' ? themes.dark : themes.light
    );
  }, []);

  return (
    <div className="app" style={{ 
      backgroundColor: currentTheme.backgroundColor,
      color: currentTheme.textColor,
      minHeight: '100vh'
    }}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">ClearCall</h1>
          <p className="app-subtitle">Accessibility Phone Assistant</p>
          <div className="header-controls">
            <ThemeToggle 
              currentTheme={currentTheme} 
              onToggle={toggleTheme} 
            />
            <button 
              className="call-log-toggle"
              onClick={() => setShowCallLog(!showCallLog)}
              style={{
                backgroundColor: currentTheme.buttonColor,
                color: currentTheme.buttonText
              }}
            >
              {showCallLog ? 'Hide Logs' : 'Show Logs'}
            </button>
            <button 
              className="gemini-toggle"
              onClick={() => setShowGeminiInsights(!showGeminiInsights)}
              style={{
                backgroundColor: geminiConnected ? '#28a745' : '#6c757d',
                color: 'white'
              }}
            >
              🤖 AI Insights
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {showCallLog ? (
          <CallLog 
            logs={callLogs}
            theme={currentTheme}
            onClearLogs={() => setCallLogs([])}
          />
        ) : (
          <>
            <div className="controls-section">
              <SpeechRecognition
                isListening={isListening}
                onStart={startCall}
                onStop={endCall}
                onTranscriptUpdate={handleTranscriptUpdate}
                theme={currentTheme}
              />
              
              {transcript.length > 0 && (
                <button 
                  className="clear-button"
                  onClick={clearTranscript}
                  style={{
                    backgroundColor: currentTheme.buttonColor,
                    color: currentTheme.buttonText
                  }}
                >
                  Clear Transcript
                </button>
              )}
            </div>

            <CaptionDisplay 
              transcript={transcript}
              theme={currentTheme}
            />

            <GeminiInsights
              theme={currentTheme}
              isVisible={showGeminiInsights}
              onToggle={() => setShowGeminiInsights(!showGeminiInsights)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
