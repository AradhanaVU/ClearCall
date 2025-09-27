import React, { useEffect, useRef } from 'react';
import { TranscriptEntry, Theme } from '../types';
import './CaptionDisplay.css';

interface CaptionDisplayProps {
  transcript: TranscriptEntry[];
  theme: Theme;
}

const CaptionDisplay: React.FC<CaptionDisplayProps> = ({ transcript, theme }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcript entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

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

  if (transcript.length === 0) {
    return (
      <div className="caption-display empty" style={{ backgroundColor: theme.captionBackground }}>
        <div className="empty-state">
          <h3 style={{ color: theme.textColor }}>No transcript yet</h3>
          <p style={{ color: theme.textColor, opacity: 0.7 }}>
            Start listening to see real-time captions appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="caption-display" style={{ backgroundColor: theme.captionBackground }}>
      <div className="caption-header">
        <h2 style={{ color: theme.textColor }}>Live Captions</h2>
        <div className="caption-stats">
          <span style={{ color: theme.textColor }}>
            {transcript.length} entries
          </span>
          <span style={{ color: theme.warningColor }}>
            {transcript.filter(entry => entry.isScamWarning).length} warnings
          </span>
        </div>
      </div>
      
      <div className="caption-content" ref={scrollRef}>
        {transcript.map((entry) => (
          <div 
            key={entry.id} 
            className={`caption-entry ${entry.isScamWarning ? 'scam-warning' : ''}`}
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
            
            {entry.scamKeywords.length > 0 && (
              <div className="scam-keywords">
                <span style={{ color: theme.textColor, opacity: 0.7 }}>
                  Detected keywords: 
                </span>
                {entry.scamKeywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="keyword-tag"
                    style={{ backgroundColor: theme.warningColor }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaptionDisplay;
