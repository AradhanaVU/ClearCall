import React, { useState } from 'react';
import { Theme, TranscriptEntry } from '../types';
import './CallTranscriptPage.css';

interface CallTranscriptPageProps {
  theme: Theme;
}

const CallTranscriptPage: React.FC<CallTranscriptPageProps> = ({ theme }) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const highlightScamKeywords = (text: string, scamKeywords: string[]) => {
    if (scamKeywords.length === 0) return text;

    let highlightedText = text;
    scamKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<mark class="scam-highlight">${keyword}</mark>`
      );
    });
    return highlightedText;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="call-transcript-page" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="transcript-header">
        <h1 style={{ color: theme.textColor }}>Call Transcripts</h1>
        <p style={{ color: theme.textColor }}>View and manage your call transcripts</p>
      </div>

      <div className="transcript-box-container">
        <div className="transcript-box" style={{ backgroundColor: theme.captionBackground }}>
          <div className="transcript-header-box">
            <h2 style={{ color: theme.textColor }}>Live Captions</h2>
            <div className="transcript-stats">
              <span style={{ color: theme.textColor }}>
                {transcript.length} entries
              </span>
              <span style={{ color: theme.warningColor }}>
                {transcript.filter(entry => entry.isScamWarning).length} warnings
              </span>
            </div>
          </div>
          
          <div className="transcript-content-box">
            {transcript.length === 0 ? (
              <div className="empty-transcript">
                <h3 style={{ color: theme.textColor }}>No transcript yet</h3>
                <p style={{ color: theme.textColor, opacity: 0.7 }}>
                  Start listening to see real-time captions appear here
                </p>
              </div>
            ) : (
              <div className="transcript-entries">
                {transcript.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`transcript-entry ${entry.isScamWarning ? 'scam-warning' : ''}`}
                    style={{
                      backgroundColor: entry.isScamWarning 
                        ? `${theme.warningColor}20` 
                        : 'transparent',
                      borderLeft: entry.isScamWarning 
                        ? `4px solid ${theme.warningColor}` 
                        : '4px solid transparent'
                    }}
                  >
                    <div className="entry-header">
                      <span className="timestamp" style={{ color: theme.textColor, opacity: 0.7 }}>
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      {entry.isScamWarning && (
                        <span className="warning-badge" style={{ backgroundColor: theme.warningColor }}>
                          ⚠️ SCAM WARNING
                        </span>
                      )}
                    </div>
                    
                    <div 
                      className="entry-text"
                      style={{ color: theme.captionText }}
                      dangerouslySetInnerHTML={{
                        __html: highlightScamKeywords(entry.text, entry.scamKeywords)
                      }}
                    />
                    
                    {entry.isScamWarning && entry.scamKeywords.length > 0 && (
                      <div className="scam-keywords" style={{ color: theme.warningColor }}>
                        <strong>Warning Keywords:</strong> {entry.scamKeywords.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallTranscriptPage;
