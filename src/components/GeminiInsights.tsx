import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GeminiAnalysis, ConversationSummary, geminiService } from '../services/geminiService';
import { Theme } from '../types';
import './GeminiInsights.css';

interface GeminiInsightsProps {
  theme: Theme;
  isVisible: boolean;
  onToggle: () => void;
}

export interface GeminiInsightsRef {
  analyzeText: (text: string) => Promise<void>;
}

const GeminiInsights = forwardRef<GeminiInsightsRef, GeminiInsightsProps>(({ theme, isVisible, onToggle }, ref) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<GeminiAnalysis | null>(null);
  const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to backend on component mount
    const connectToBackend = async () => {
      try {
        await geminiService.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Failed to connect to Gemini backend:', err);
        setError('Unable to connect to AI analysis service');
        setIsConnected(false);
      }
    };

    connectToBackend();

    // Cleanup on unmount
    return () => {
      geminiService.disconnect();
    };
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    analyzeText: async (text: string) => {
      if (!isConnected) {
        setError('Not connected to AI service');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const analysis = await geminiService.analyzeText(text);
        if (analysis) {
          setCurrentAnalysis(analysis);
        } else {
          setError('Analysis failed');
        }
      } catch (err) {
        setError('Error analyzing text');
      } finally {
        setIsLoading(false);
      }
    }
  }));

  const generateSummary = async () => {
    if (!isConnected) {
      setError('Not connected to AI service');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const summary = await geminiService.generateSummary();
      if (summary) {
        setConversationSummary(summary);
      } else {
        setError('Summary generation failed');
      }
    } catch (err) {
      setError('Error generating summary');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#fd7e14';
      case 'low':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  if (!isVisible) {
    return (
      <button
        className="gemini-toggle-button"
        onClick={onToggle}
        style={{
          backgroundColor: theme.buttonColor,
          color: theme.buttonText
        }}
      >
        🤖 AI Insights
      </button>
    );
  }

  return (
    <div className="gemini-insights" style={{ backgroundColor: theme.captionBackground }}>
      <div className="insights-header">
        <h3 style={{ color: theme.textColor }}>🤖 AI-Powered Insights</h3>
        <div className="header-controls">
          <div className="connection-status">
            <span 
              className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
              style={{ 
                backgroundColor: isConnected ? '#28a745' : '#dc3545',
                color: 'white'
              }}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          <button
            className="close-button"
            onClick={onToggle}
            style={{ color: theme.textColor }}
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: theme.warningColor }}>
          ⚠️ {error}
        </div>
      )}

      <div className="insights-content">
        {/* AI Analysis Section */}
        {currentAnalysis && (
          <div className="analysis-section">
            <h4 style={{ color: theme.textColor }}>🔍 AI Analysis</h4>
            <div 
              className="risk-assessment"
              style={{
                backgroundColor: `${getRiskColor(currentAnalysis.riskLevel)}20`,
                borderLeft: `4px solid ${getRiskColor(currentAnalysis.riskLevel)}`
              }}
            >
              <div className="risk-header">
                <span className="risk-icon">{getRiskIcon(currentAnalysis.riskLevel)}</span>
                <span 
                  className="risk-level"
                  style={{ color: getRiskColor(currentAnalysis.riskLevel) }}
                >
                  {currentAnalysis.riskLevel.toUpperCase()} RISK
                </span>
                <span className="risk-score" style={{ color: theme.textColor }}>
                  Score: {currentAnalysis.riskScore}/100
                </span>
              </div>
              
              <div className="risk-details">
                <p style={{ color: theme.textColor }}>
                  {currentAnalysis.explanation}
                </p>
                
                {currentAnalysis.suspiciousElements.length > 0 && (
                  <div className="suspicious-elements">
                    <h5 style={{ color: theme.textColor }}>Suspicious Elements:</h5>
                    <ul>
                      {currentAnalysis.suspiciousElements.map((element, index) => (
                        <li key={index} style={{ color: theme.textColor }}>
                          • {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentAnalysis.recommendations.length > 0 && (
                  <div className="recommendations">
                    <h5 style={{ color: theme.textColor }}>Recommendations:</h5>
                    <ul>
                      {currentAnalysis.recommendations.map((rec, index) => (
                        <li key={index} style={{ color: theme.textColor }}>
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conversation Summary Section */}
        {conversationSummary && (
          <div className="summary-section">
            <h4 style={{ color: theme.textColor }}>📝 Conversation Summary</h4>
            <div className="summary-content" style={{ backgroundColor: `${theme.buttonColor}20` }}>
              <p style={{ color: theme.textColor }}>
                {conversationSummary.summary}
              </p>
              
              {conversationSummary.keyPoints.length > 0 && (
                <div className="key-points">
                  <h5 style={{ color: theme.textColor }}>Key Points:</h5>
                  <ul>
                    {conversationSummary.keyPoints.map((point, index) => (
                      <li key={index} style={{ color: theme.textColor }}>
                        • {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {conversationSummary.actionItems.length > 0 && (
                <div className="action-items">
                  <h5 style={{ color: theme.textColor }}>Action Items:</h5>
                  <ul>
                    {conversationSummary.actionItems.map((item, index) => (
                      <li key={index} style={{ color: theme.textColor }}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="insights-controls">
          <button
            className="summary-button"
            onClick={generateSummary}
            disabled={isLoading || !isConnected}
            style={{
              backgroundColor: theme.buttonColor,
              color: theme.buttonText,
              opacity: isLoading || !isConnected ? 0.5 : 1
            }}
          >
            {isLoading ? '⏳ Generating...' : '📝 Generate Summary'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default GeminiInsights;
