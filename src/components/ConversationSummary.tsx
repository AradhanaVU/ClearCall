import React, { useState } from 'react';
import { ConversationSummary as ConversationSummaryType, Theme } from '../types';
import { geminiService } from '../services/geminiService';
import './ConversationSummary.css';

interface ConversationSummaryProps {
  theme: Theme;
  conversationId?: string;
  onSummaryGenerated?: (summary: ConversationSummaryType) => void;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
  theme,
  conversationId,
  onSummaryGenerated
}) => {
  const [summary, setSummary] = useState<ConversationSummaryType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);
   
    try {
      console.log('🔄 Generating conversation summary...');
      const summaryData = await geminiService.generateSummary();
     
      if (summaryData) {
        setSummary(summaryData);
        onSummaryGenerated?.(summaryData);
        console.log('✅ Summary generated successfully:', summaryData);
      } else {
        setError('Failed to generate summary. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error generating summary:', err);
      setError('Error generating summary. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSummary = () => {
    setSummary(null);
    setError(null);
  };

  return (
    <div className="conversation-summary" style={{ backgroundColor: theme.captionBackground }}>
      <div className="summary-header">
        <h3 style={{ color: theme.textColor }}>
          📋 Conversation Summary
        </h3>
        <div className="summary-controls">
          {!summary && (
            <button
              className="generate-summary-btn"
              onClick={generateSummary}
              disabled={isGenerating}
              style={{
                backgroundColor: isGenerating ? theme.buttonColor + '80' : theme.buttonColor,
                color: theme.buttonText,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? '🔄 Generating...' : '📝 Generate Summary'}
            </button>
          )}
          {summary && (
            <button
              className="clear-summary-btn"
              onClick={clearSummary}
              style={{
                backgroundColor: theme.warningColor,
                color: theme.buttonText
              }}
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="summary-error" style={{ color: theme.warningColor }}>
          ⚠️ {error}
        </div>
      )}

      {summary && (
        <div className="summary-content">
          <div className="summary-section">
            <h4 style={{ color: theme.textColor }}>📄 Summary</h4>
            <p style={{ color: theme.captionText }}>{summary.summary}</p>
          </div>

          {summary.keyPoints.length > 0 && (
            <div className="summary-section">
              <h4 style={{ color: theme.textColor }}>🎯 Key Points</h4>
              <ul style={{ color: theme.captionText }}>
                {summary.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.actionItems.length > 0 && (
            <div className="summary-section">
              <h4 style={{ color: theme.textColor }}>✅ Action Items</h4>
              <ul style={{ color: theme.captionText }}>
                {summary.actionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {(summary.importantDetails.dates.length > 0 ||
            summary.importantDetails.amounts.length > 0 ||
            summary.importantDetails.names.length > 0) && (
            <div className="summary-section">
              <h4 style={{ color: theme.textColor }}>📊 Important Details</h4>
              <div className="details-grid">
                {summary.importantDetails.dates.length > 0 && (
                  <div className="detail-category">
                    <strong style={{ color: theme.textColor }}>📅 Dates:</strong>
                    <ul style={{ color: theme.captionText }}>
                      {summary.importantDetails.dates.map((date, index) => (
                        <li key={index}>{date}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.importantDetails.amounts.length > 0 && (
                  <div className="detail-category">
                    <strong style={{ color: theme.textColor }}>💰 Amounts:</strong>
                    <ul style={{ color: theme.captionText }}>
                      {summary.importantDetails.amounts.map((amount, index) => (
                        <li key={index}>{amount}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.importantDetails.names.length > 0 && (
                  <div className="detail-category">
                    <strong style={{ color: theme.textColor }}>👤 Names:</strong>
                    <ul style={{ color: theme.captionText }}>
                      {summary.importantDetails.names.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!summary && !isGenerating && !error && (
        <div className="summary-placeholder" style={{ color: theme.textColor, opacity: 0.7 }}>
          <p>Click "Generate Summary" to create an AI-powered summary of your conversation.</p>
          <p>The summary will include key points, action items, and important details.</p>
        </div>
      )}
    </div>
  );
};

export default ConversationSummary;
