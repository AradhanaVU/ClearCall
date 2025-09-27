import React, { useState, useMemo } from 'react';
import { CallLogEntry, Theme } from '../types';
import './CallHistoryPage.css';

interface CallHistoryPageProps {
  logs: CallLogEntry[];
  theme: Theme;
  onClearLogs: () => void;
}

const CallHistoryPage: React.FC<CallHistoryPageProps> = ({ logs, theme, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'warnings' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<CallLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'overview'>('transcript');

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs.filter(log => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return log.transcript.some(entry => 
        entry.text.toLowerCase().includes(query) ||
        entry.scamKeywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'warnings':
          comparison = a.totalScamWarnings - b.totalScamWarnings;
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [logs, searchQuery, sortBy, sortOrder]);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWarningColor = (warnings: number) => {
    if (warnings === 0) return '#44aa44';
    if (warnings <= 2) return '#ff8800';
    return '#ff4444';
  };

  const handleLogClick = (log: CallLogEntry) => {
    setSelectedLog(log);
    setActiveTab('transcript');
  };

  return (
    <div className="call-history-page" style={{ 
      backgroundColor: theme.backgroundColor,
      color: theme.textColor
    }}>
      <div className="call-history-header">
        <div className="header-actions">
          <button 
            className="clear-logs-button"
            onClick={onClearLogs}
            style={{
              backgroundColor: '#ff4444',
              color: 'white'
            }}
          >
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="call-history-content">
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search call transcripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            />
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="warnings">Sort by Warnings</option>
              <option value="duration">Sort by Duration</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className={`call-history-layout ${selectedLog ? 'with-details' : 'full-width'}`}>
          <div className="call-logs-table-container">
            <h3>Call Logs ({filteredAndSortedLogs.length})</h3>
            
            {filteredAndSortedLogs.length === 0 ? (
              <div className="no-logs">
                <p>No call logs found.</p>
                <p>Start making calls to see your history here.</p>
              </div>
            ) : (
              <div className="call-logs-table">
                <div className="table-header">
                  <div className="table-cell type-header">Type</div>
                  <div className="table-cell date-header">Date & Time</div>
                  <div className="table-cell duration-header">Duration</div>
                  <div className="table-cell caller-header">Caller</div>
                  <div className="table-cell warnings-header">Warnings</div>
                  <div className="table-cell transcript-header">Preview</div>
                </div>
                
                <div className="table-body">
                  {filteredAndSortedLogs.map(log => (
                  <div 
                    key={log.id}
                    className={`table-row ${selectedLog?.id === log.id ? 'selected' : ''}`}
                    onClick={() => handleLogClick(log)}
                      style={{
                        backgroundColor: selectedLog?.id === log.id ? '#dbeafe' : '#ffffff',
                        color: selectedLog?.id === log.id ? '#1e40af' : '#1e40af',
                        borderLeft: log.totalScamWarnings > 0 ? `4px solid ${getWarningColor(log.totalScamWarnings)}` : '4px solid transparent'
                      }}
                    >
                      <div className="table-cell type-cell">
                        <div className="call-type-badge">
                          {log.callType === 'recording' ? '🎤 Recording' : '📞 Call'}
                        </div>
                      </div>
                      
                      <div className="table-cell date-cell">
                        <div className="date-info">
                          <div className="date">{log.startTime.toLocaleDateString()}</div>
                          <div className="time">{log.startTime.toLocaleTimeString()}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell duration-cell">
                        <div className="duration-badge">
                          {formatDuration(log.duration || 0)}
                        </div>
                      </div>
                      
                      <div className="table-cell caller-cell">
                        <div className="caller-info">
                          {log.callerId || 'Unknown Caller'}
                        </div>
                      </div>
                      
                      <div className="table-cell warnings-cell">
                        <div 
                          className="warnings-badge"
                          style={{ 
                            backgroundColor: getWarningColor(log.totalScamWarnings) + '20',
                            color: getWarningColor(log.totalScamWarnings),
                            border: `1px solid ${getWarningColor(log.totalScamWarnings)}`
                          }}
                        >
                          {log.totalScamWarnings}
                        </div>
                      </div>
                      
                      <div className="table-cell transcript-cell">
                        <div className="transcript-preview">
                          {log.transcript.length > 0 
                            ? log.transcript[0].text.substring(0, 80) + (log.transcript[0].text.length > 80 ? '...' : '')
                            : 'No transcript'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedLog && (
            <div className="call-log-details">
              <div className="call-log-details-header">
                <button 
                  className="close-details"
                  onClick={() => setSelectedLog(null)}
                  style={{ color: theme.textColor }}
                >
                  ×
                </button>
              </div>
              
              <div className="call-log-details-content">
                <div className="detail-section">
                  <h4>Call Information</h4>
                  <p><strong>Start Time:</strong> {selectedLog.startTime.toLocaleString()}</p>
                  <p><strong>End Time:</strong> {selectedLog.endTime.toLocaleString()}</p>
                  <p><strong>Duration:</strong> {formatDuration(selectedLog.startTime, selectedLog.endTime)}</p>
                  <p><strong>Total Scam Warnings:</strong> 
                    <span style={{ color: getWarningColor(selectedLog.totalScamWarnings), marginLeft: '8px' }}>
                      {selectedLog.totalScamWarnings}
                    </span>
                  </p>
                  <p><strong>Transcript Entries:</strong> {selectedLog.transcript.length}</p>
                </div>
                
                <div className="tabs-section">
                  <div className="tabs-header">
                    <button 
                      className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
                      onClick={() => setActiveTab('transcript')}
                      style={{
                        backgroundColor: activeTab === 'transcript' ? theme.buttonColor : 'transparent',
                        color: activeTab === 'transcript' ? theme.buttonText : theme.textColor
                      }}
                    >
                      Transcript
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveTab('overview')}
                      style={{
                        backgroundColor: activeTab === 'overview' ? theme.buttonColor : 'transparent',
                        color: activeTab === 'overview' ? theme.buttonText : theme.textColor
                      }}
                    >
                      AI Overview
                    </button>
                  </div>
                  
                  <div className="tabs-content">
                    {activeTab === 'transcript' && (
                      <div className="transcript-tab">
                        <h4>Full Transcript</h4>
                        <div className="transcript-container">
                          {selectedLog.transcript.length === 0 ? (
                            <p className="no-transcript">No transcript available for this call.</p>
                          ) : (
                            selectedLog.transcript.map((entry, index) => (
                              <div 
                                key={entry.id}
                                className={`transcript-entry ${entry.isScamWarning ? 'scam-warning' : ''}`}
                                style={{
                                  backgroundColor: entry.isScamWarning ? theme.warningColor + '20' : 'transparent',
                                  borderLeft: entry.isScamWarning ? `3px solid ${theme.warningColor}` : '3px solid transparent'
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
                                    <strong>Warning Keywords:</strong> {entry.scamKeywords.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'overview' && (
                      <div className="overview-tab">
                        <h4>AI Call Analysis</h4>
                        <div className="ai-overview-content">
                          <div className="overview-section">
                            <h5>Call Summary</h5>
                            <p>This {selectedLog.callType === 'recording' ? 'recording session' : 'call'} lasted {formatDuration(selectedLog.startTime, selectedLog.endTime)} and contained {selectedLog.transcript.length} transcript entries.</p>
                          </div>
                          
                          <div className="overview-section">
                            <h5>Scam Risk Assessment</h5>
                            <div className="risk-assessment">
                              <div className="risk-level">
                                <strong>Risk Level:</strong> 
                                <span style={{ 
                                  color: getWarningColor(selectedLog.totalScamWarnings),
                                  marginLeft: '8px',
                                  fontWeight: '600'
                                }}>
                                  {selectedLog.totalScamWarnings === 0 ? 'Low' : 
                                   selectedLog.totalScamWarnings <= 2 ? 'Medium' : 'High'}
                                </span>
                              </div>
                              <div className="risk-details">
                                <p><strong>Total Warnings:</strong> {selectedLog.totalScamWarnings}</p>
                                <p><strong>Scam Keywords Detected:</strong> {selectedLog.transcript.reduce((acc, entry) => acc + entry.scamKeywords.length, 0)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="overview-section">
                            <h5>Key Insights</h5>
                            <ul className="insights-list">
                              {selectedLog.totalScamWarnings === 0 && (
                                <li>✅ No scam indicators detected - this appears to be a legitimate call</li>
                              )}
                              {selectedLog.totalScamWarnings > 0 && selectedLog.totalScamWarnings <= 2 && (
                                <li>⚠️ Some suspicious language detected - exercise caution</li>
                              )}
                              {selectedLog.totalScamWarnings > 2 && (
                                <li>🚨 High scam risk detected - this call likely contains fraudulent content</li>
                              )}
                              {selectedLog.transcript.length > 10 && (
                                <li>📝 Detailed conversation with {selectedLog.transcript.length} transcript entries</li>
                              )}
                              {selectedLog.duration && selectedLog.duration > 300 && (
                                <li>⏱️ Long duration call ({formatDuration(selectedLog.startTime, selectedLog.endTime)})</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CallHistoryPage;