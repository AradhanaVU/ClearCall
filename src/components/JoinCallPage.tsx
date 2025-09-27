import React, { useState } from 'react';
import { Theme } from '../types';
import './JoinCallPage.css';

interface JoinCallPageProps {
  theme: Theme;
  onJoinCall: (callLink: string) => void;
}

const JoinCallPage: React.FC<JoinCallPageProps> = ({ theme, onJoinCall }) => {
  const [callLink, setCallLink] = useState('');
  const [error, setError] = useState('');

  const handleJoinCall = () => {
    if (!callLink.trim()) {
      setError('Please enter a call link');
      return;
    }

    // Basic validation for call links
    const isValidLink = callLink.includes('://') || callLink.includes('.') || callLink.startsWith('meet.google.com') || callLink.startsWith('zoom.us') || callLink.startsWith('teams.microsoft.com');
    
    if (!isValidLink) {
      setError('Please enter a valid call link (e.g., Google Meet, Zoom, Teams)');
      return;
    }

    setError('');
    onJoinCall(callLink.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinCall();
    }
  };

  return (
    <div className="join-call-page">
      <div className="join-call-container">
        <div className="join-call-header">
          <p>Enter a call link to join an existing meeting or call</p>
        </div>

        <div className="join-call-form">
          <div className="input-group">
            <label htmlFor="call-link">Call Link</label>
            <input
              id="call-link"
              type="text"
              placeholder="https://meet.google.com/abc-defg-hij or paste any call link here..."
              value={callLink}
              onChange={(e) => {
                setCallLink(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `2px solid ${theme.buttonColor}`,
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {error && (
              <div className="error-message" style={{ color: theme.warningColor }}>
                {error}
              </div>
            )}
          </div>

          <div className="supported-platforms">
            <h3>Supported Platforms</h3>
            <div className="platform-list">
              <div className="platform-item">
                <span className="platform-icon">📹</span>
                <span>Google Meet</span>
              </div>
              <div className="platform-item">
                <span className="platform-icon">🔗</span>
                <span>Zoom</span>
              </div>
              <div className="platform-item">
                <span className="platform-icon">💼</span>
                <span>Microsoft Teams</span>
              </div>
              <div className="platform-item">
                <span className="platform-icon">📞</span>
                <span>Other Call Links</span>
              </div>
            </div>
          </div>

          <button
            className="join-call-button"
            onClick={handleJoinCall}
            style={{
              backgroundColor: theme.buttonColor,
              color: theme.buttonText,
              border: 'none',
              borderRadius: '8px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              marginTop: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <span className="button-icon">🚀</span>
            Join Call
          </button>
        </div>

        <div className="join-call-info">
          <h3>How it works</h3>
          <ul>
            <li>Paste any call link from your calendar or invitation</li>
            <li>ClearCall will analyze the call for scam detection</li>
            <li>Real-time transcription and warnings during the call</li>
            <li>Call summary and transcript saved after the call</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinCallPage;
