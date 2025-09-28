import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptEntry, ScamKeyword, Theme, CallLogEntry } from './types';
import SpeechRecognition from './components/SpeechRecognition';
import CaptionDisplay from './components/CaptionDisplay';
import GeminiInsights, { GeminiInsightsRef } from './components/GeminiInsights';
import { ScamDetector } from './utils/ScamDetector';
import ThemeToggle from './components/ThemeToggle';
import CallLog from './components/CallLog';
import ScammerKeypad from './components/ScammerKeypad';
import CallInterface from './components/CallInterface';
import { themes } from './utils/themes';
import { scamKeywords } from './utils/scamKeywords';
import { geminiService } from './services/geminiService';
import io from 'socket.io-client';
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
  const [demoMode, setDemoMode] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const geminiInsightsRef = useRef<GeminiInsightsRef>(null);

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

  // Check Gemini connection status
  useEffect(() => {
    const checkGeminiConnection = async () => {
      try {
        const isConnected = await geminiService.healthCheck();
        setGeminiConnected(isConnected);
        console.log('🔍 Gemini connection status:', isConnected);
      } catch (error) {
        console.error('❌ Gemini health check failed:', error);
        setGeminiConnected(false);
      }
    };

    checkGeminiConnection();
    // Check every 10 seconds
    const interval = setInterval(checkGeminiConnection, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Socket.IO connection for call handling (only in demo mode)
  useEffect(() => {
    if (!demoMode) return;
    
    console.log('🔌 Setting up socket connection for demo mode...');
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      // Join the accessibility room
      socket.emit('join-conversation', 'accessibility');
      console.log('📞 Joined accessibility room');
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
    
    // Listen for incoming calls
    socket.on('incoming-call', (data) => {
      console.log('📞 Incoming call received:', data);
      setIncomingCall(data);
      // Auto-answer the call
      socket.emit('accept-call', data);
      console.log('📞 Auto-answering call...');
    });

    // Handle call accepted
    socket.on('call-accepted', (data) => {
      console.log('✅ Call accepted:', data);
      setIsInCall(true);
      setIncomingCall(null);
      // Auto-start listening when call is accepted
      if (!isListening) {
        console.log('🎤 Starting speech recognition...');
        startCall();
      }
    });

    // Handle call ended
    socket.on('call-ended', (data) => {
      console.log('📞 Call ended:', data);
      setIsInCall(false);
      setIncomingCall(null);
      // End the call and save logs
      if (isListening) {
        console.log('🎤 Ending speech recognition...');
        endCall();
      }
    });

    // Handle call rejected
    socket.on('call-rejected', (data) => {
      console.log('❌ Call rejected:', data);
      setIncomingCall(null);
    });

    return () => {
      console.log('🔌 Cleaning up socket connection...');
      socket.disconnect();
    };
  }, [demoMode, isListening]);

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
    console.log('🎤 New transcript received:', newText);
    console.log('🔌 Gemini connected:', geminiConnected);
    console.log('👁️ Insights visible:', showGeminiInsights);
    console.log('🔗 Ref available:', !!geminiInsightsRef.current);
    
    if (geminiConnected && showGeminiInsights && geminiInsightsRef.current) {
      try {
        console.log('🚀 Triggering AI analysis...');
        await geminiInsightsRef.current.analyzeText(newText);
        console.log('✅ AI analysis triggered successfully');
      } catch (error) {
        console.error('❌ Gemini analysis error:', error);
      }
    } else {
      console.log('⚠️ AI analysis not triggered - conditions not met');
      console.log('- Gemini connected:', geminiConnected);
      console.log('- Insights visible:', showGeminiInsights);
      console.log('- Ref available:', !!geminiInsightsRef.current);
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
            <button 
              className="demo-toggle"
              onClick={() => setDemoMode(!demoMode)}
              style={{
                backgroundColor: demoMode ? '#ff6b35' : '#17a2b8',
                color: 'white'
              }}
            >
              {demoMode ? '📞 Exit Demo' : '🎭 Demo Mode'}
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
        ) : demoMode ? (
          <div className="demo-mode" style={{ display: 'flex', height: '100vh', gap: '20px' }}>
            {/* Left Side - Scammer Interface */}
            <div className="scammer-side" style={{ 
              flex: 1, 
              backgroundColor: '#2c3e50', 
              padding: '20px', 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h2 style={{ color: '#ecf0f1', marginBottom: '20px' }}>📞 Scammer Interface</h2>
              <ScammerKeypad />
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                  Simulate calling the accessibility assistant
                </p>
              </div>
            </div>

            {/* Right Side - Accessibility Assistant */}
            <div className="assistant-side" style={{ 
              flex: 1, 
              backgroundColor: currentTheme.backgroundColor, 
              padding: '20px', 
              borderRadius: '12px',
              border: '2px solid #3498db'
            }}>
              <h2 style={{ color: currentTheme.textColor, marginBottom: '20px', textAlign: 'center' }}>
                🤖 ClearCall Assistant
              </h2>
              
              {isInCall ? (
                <div>
                  <div style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    📞 Call Active - Listening and analyzing...
                  </div>
                  
                  <div className="controls-section">
                    <SpeechRecognition
                      isListening={isListening}
                      onStart={startCall}
                      onStop={endCall}
                      onTranscriptUpdate={handleTranscriptUpdate}
                      theme={currentTheme}
                    />
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                      <button 
                        className="gemini-toggle"
                        onClick={() => setShowGeminiInsights(!showGeminiInsights)}
                        style={{
                          backgroundColor: geminiConnected ? '#28a745' : '#6c757d',
                          color: 'white',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        🤖 AI Insights
                      </button>
                      
                      {transcript.length > 0 && (
                        <button 
                          className="clear-button"
                          onClick={clearTranscript}
                          style={{
                            backgroundColor: currentTheme.buttonColor,
                            color: currentTheme.buttonText,
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Clear Transcript
                        </button>
                      )}
                    </div>
                  </div>

                  <CaptionDisplay 
                    transcript={transcript}
                    theme={currentTheme}
                  />

                  <GeminiInsights
                    ref={geminiInsightsRef}
                    theme={currentTheme}
                    isVisible={showGeminiInsights}
                    onToggle={() => setShowGeminiInsights(!showGeminiInsights)}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: currentTheme.captionText, fontSize: '1.1rem' }}>
                    Waiting for incoming call...
                  </p>
                  <p style={{ color: currentTheme.captionText, fontSize: '0.9rem', marginTop: '10px' }}>
                    Use the scammer interface to simulate a call
                  </p>
                </div>
              )}
            </div>
          </div>
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
              ref={geminiInsightsRef}
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
