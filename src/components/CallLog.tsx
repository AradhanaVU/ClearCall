import React, { useState } from 'react';
import { CallLogEntry, Theme } from '../types';
import './CallLog.css';

interface CallLogProps {
  logs: CallLogEntry[];
  theme: Theme;
  onClearLogs: () => void;
}

const CallLog: React.FC<CallLogProps> = ({ logs, theme, onClearLogs }) => {
  const [selectedLog, setSelectedLog] = useState<CallLogEntry | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime: Date, endTime: Date) => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const exportLog = (log: CallLogEntry) => {
    const content = `ClearCall Transcript - ${formatDate(log.startTime)}
Duration: ${formatDuration(log.startTime, log.endTime)}
Total Scam Warnings: ${log.totalScamWarnings}

TRANSCRIPT:
${log.transcript.map(entry => 
  `[${entry.timestamp.toLocaleTimeString()}] ${entry.text}${entry.isScamWarning ? ' ⚠️ SCAM WARNING' : ''}`
).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearcall-transcript-${log.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (logs.length === 0) {
    return (
      <div className="call-log empty" style={{ backgroundColor: theme.captionBackground }}>
        <div className="empty-state">
          <h3 style={{ color: theme.textColor }}>No call logs yet</h3>
          <p style={{ color: theme.textColor, opacity: 0.7 }}>
            Start a conversation to see your call history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="call-log" style={{ backgroundColor: theme.captionBackground }}>
      <div className="log-header">
        <h2 style={{ color: theme.textColor }}>Call History</h2>
        <div className="log-controls">
          <span className="log-count" style={{ color: theme.textColor }}>
            {logs.length} calls
          </span>
          <button
            className="clear-logs-button"
            onClick={onClearLogs}
            style={{
              backgroundColor: theme.warningColor,
              color: theme.buttonText
            }}
          >
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="log-content">
        <div className="log-list">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`log-item ${selectedLog?.id === log.id ? 'selected' : ''}`}
              onClick={() => setSelectedLog(log)}
              style={{
                backgroundColor: selectedLog?.id === log.id 
                  ? `${theme.buttonColor}20` 
                  : 'transparent',
                borderLeft: selectedLog?.id === log.id 
                  ? `4px solid ${theme.buttonColor}` 
                  : '4px solid transparent'
              }}
            >
              <div className="log-summary">
                <div className="log-date" style={{ color: theme.textColor }}>
                  {formatDate(log.startTime)}
                </div>
                <div className="log-duration" style={{ color: theme.textColor, opacity: 0.7 }}>
                  Duration: {formatDuration(log.startTime, log.endTime)}
                </div>
                <div className="log-stats">
                  <span style={{ color: theme.textColor }}>
                    {log.transcript.length} entries
                  </span>
                  {log.totalScamWarnings > 0 && (
                    <span 
                      className="warning-count"
                      style={{ color: theme.warningColor }}
                    >
                      {log.totalScamWarnings} warnings
                    </span>
                  )}
                </div>
              </div>
              <button
                className="export-button"
                onClick={(e) => {
                  e.stopPropagation();
                  exportLog(log);
                }}
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonText
                }}
              >
                Export
              </button>
            </div>
          ))}
        </div>

        {selectedLog && (
          <div className="log-details">
            <div className="details-header">
              <h3 style={{ color: theme.textColor }}>
                Transcript - {formatDate(selectedLog.startTime)}
              </h3>
              <button
                className="close-details"
                onClick={() => setSelectedLog(null)}
                style={{ color: theme.textColor }}
              >
                ✕
              </button>
            </div>
            <div className="details-content">
              {selectedLog.transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`transcript-entry ${entry.isScamWarning ? 'scam-warning' : ''}`}
                  style={{
                    backgroundColor: entry.isScamWarning 
                      ? `${theme.warningColor}20` 
                      : 'transparent',
                    borderLeft: entry.isScamWarning 
                      ? `3px solid ${theme.warningColor}` 
                      : '3px solid transparent'
                  }}
                >
                  <div className="entry-time" style={{ color: theme.textColor, opacity: 0.7 }}>
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="entry-text" style={{ color: theme.captionText }}>
                    {entry.text}
                  </div>
                  {entry.isScamWarning && (
                    <div className="warning-indicator" style={{ color: theme.warningColor }}>
                      ⚠️ Scam warning: {entry.scamKeywords.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLog;
