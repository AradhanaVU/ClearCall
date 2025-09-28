import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { TranscriptEntry, ScamKeyword, Theme, CallLogEntry } from './types';
import SpeechRecognition from './components/SpeechRecognition';
import CaptionDisplay from './components/CaptionDisplay';
import CallInterface from './components/CallInterface'; // ADD THIS
import { ScamDetector } from './utils/ScamDetector';
import ThemeToggle from './components/ThemeToggle';
import CallLog from './components/CallLog';
import { themes } from './utils/themes';
import { scamKeywords } from './utils/scamKeywords';
import './App.css';
import JoinCall from './components/JoinCall';
import ScammerKeypad from './components/ScammerKeypad';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [showCallLog, setShowCallLog] = useState(false);

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

  const handleTranscriptUpdate = useCallback((newText: string) => {
    const scamDetection = ScamDetector.detectScamKeywords(newText, scamKeywords);
    
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      text: newText,
      timestamp: new Date(),
      isScamWarning: scamDetection.hasScamKeywords,
      scamKeywords: scamDetection.keywords
    };

    setTranscript(prev => [...prev, newEntry]);
  }, []);

  // ADD THESE NEW FUNCTIONS FOR CALLING
  const startCall = useCallback(async (phoneNumber: string) => {
    try {
      // Generate a unique call ID
      const callId = `call_${Date.now()}`;
      setCurrentCallId(callId);
      
      // Show instructions for the user
      alert(`Call Instructions:\n\n1. Call this number from your phone: +1-555-123-4567 (Demo Number)\n2. Start speaking when connected\n3. Your speech will be transcribed here\n\nPhone to call: ${phoneNumber}`);
      
      // Start listening for speech
      setIsListening(true);
      setTranscript([]);
      
    } catch (error) {
      console.error('Call error:', error);
      alert('Error starting call. Please try again.');
    }
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
    alert('Call ended. Transcript saved to call log.');
  }, [currentCallId, transcript]);

  const startListening = useCallback(() => {
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme(prev => 
      prev.name === 'light' ? themes.dark : themes.light
    );
  }, []);

  return (
    <Router>
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
            </div>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route
              path="/call/:callId"
              element={<JoinCall />}
            />
            <Route
              path="/"
              element={
                showCallLog ? (
                  <CallLog 
                    logs={callLogs}
                    theme={currentTheme}
                    onClearLogs={() => setCallLogs([])}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Main User Side */}
                    <div style={{ flex: 1 }}>
                      <CallInterface
                        isListening={isListening}
                        onStartCall={startCall}
                        onEndCall={endCall}
                        onTranscriptUpdate={handleTranscriptUpdate}
                        theme={currentTheme}
                      />
                      <div className="controls-section">
                        <SpeechRecognition
                          isListening={isListening}
                          onStart={startListening}
                          onStop={stopListening}
                          onTranscriptUpdate={handleTranscriptUpdate}
                          theme={currentTheme}
                        />
                        <CaptionDisplay 
                          transcript={transcript}
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
                    </div>

                    {/* Scammer Side */}
                    <div style={{ 
                      flex: '0 0 350px', 
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      borderRadius: '10px',
                      padding: '20px',
                      color: 'white'
                    }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📞 Scammer Keypad</h3>
                      <ScammerKeypad />
                    </div>
                  </div>
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;