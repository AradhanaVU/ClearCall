import React, { useState, useEffect } from 'react';
import { TranscriptEntry, Theme } from '../types';
import './CallInterface.css';

interface CallInterfaceProps {
  theme: Theme;
  onEndCall: () => void;
  onStopRecording: () => void;
  onStartRecording: () => void;
  onBack: () => void;
  isRecording?: boolean;
  transcript?: TranscriptEntry[];
  interimText?: string;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ 
  theme, 
  onEndCall, 
  onStopRecording, 
  onStartRecording, 
  onBack, 
  isRecording = false, 
  transcript = [], 
  interimText = '' 
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentScamRisk, setCurrentScamRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [scamWarnings, setScamWarnings] = useState(0);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Calculate scam warnings from actual transcript
  useEffect(() => {
    const warnings = transcript.filter(entry => entry.isScamWarning).length;
    setScamWarnings(warnings);
    
    if (warnings >= 3) {
      setCurrentScamRisk('high');
    } else if (warnings >= 1) {
      setCurrentScamRisk('medium');
    } else {
      setCurrentScamRisk('low');
    }
  }, [transcript]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'high': return 'HIGH RISK';
      case 'medium': return 'MEDIUM RISK';
      case 'low': return 'LOW RISK';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="call-interface" style={{ 
      backgroundColor: theme.backgroundColor,
      color: theme.textColor
    }}>
      <div className="call-header">
        <button 
          className="back-button"
          onClick={onBack}
          style={{
            backgroundColor: theme.captionBackground,
            color: theme.textColor
          }}
        >
          ← Back
        </button>
        <div className="call-status">
          {isCallActive && (
            <div className="call-info">
              <div className="call-duration">{formatDuration(callDuration)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="call-layout">
        {/* LEFT SIDE - Recording Controls */}
        <div className="recording-panel">
          <div className="recording-controls">
            <div className="recording-header">
              <h3>{isRecording ? 'Recording' : 'Recording Session'}</h3>
              <div className="recording-status">
                {isRecording ? (
                  <>
                    <div className="recording-indicator">🔴</div>
                    <span>Live Recording</span>
                  </>
                ) : (
                  <span>Recording Stopped</span>
                )}
              </div>
            </div>
            
            <div className="recording-actions">
              {isRecording ? (
                <button 
                  className="stop-recording-button"
                  onClick={onStopRecording}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  <span className="button-icon">⏹️</span>
                  Stop Recording
                </button>
              ) : (
                <button 
                  className="start-recording-again-button"
                  onClick={onStartRecording}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  <span className="button-icon">🎤</span>
                  Start Recording Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Transcript */}
        <div className="transcript-panel">
          <div className="transcript-header">
            <h3>{isRecording ? 'Live Transcript' : 'Call Transcript'}</h3>
            <div className="transcript-status">
              {isRecording ? (
                <>
                  <div className="recording-indicator">🔴</div>
                  <span>Recording...</span>
                </>
              ) : (
                <span>Call completed</span>
              )}
            </div>
          </div>
          
          <div className="transcript-content">
            {transcript.length === 0 && !interimText ? (
              <div className="transcript-waiting">
                <div className="waiting-icon">⏳</div>
                <p>Listening for speech...</p>
              </div>
            ) : (
              <div className="transcript-entries">
                {transcript.map((entry) => (
                  <div 
                    key={entry.id}
                    className={`transcript-entry ${entry.isScamWarning ? 'scam-warning' : ''}`}
                    style={{
                      backgroundColor: entry.isScamWarning ? theme.warningColor + '20' : 'rgba(255, 255, 255, 0.7)',
                      borderLeft: entry.isScamWarning ? `4px solid ${theme.warningColor}` : '4px solid transparent'
                    }}
                  >
                    <div className="transcript-timestamp">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="transcript-text">
                      {entry.text}
                    </div>
                    {entry.isScamWarning && entry.scamKeywords.length > 0 && (
                      <div className="scam-keywords">
                        <strong>⚠️ Warning Keywords:</strong> {entry.scamKeywords.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {interimText && (
                  <div className="transcript-entry interim-entry">
                    <div className="transcript-timestamp">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <div className="transcript-text interim-text">
                      {interimText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* End Call button when recording is stopped */}
          {!isRecording && transcript.length > 0 && (
            <div className="transcript-actions">
              <button 
                className="end-call-button"
                onClick={onEndCall}
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonText,
                  marginTop: '16px'
                }}
              >
                <span className="button-icon">📞</span>
                End Call & Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;