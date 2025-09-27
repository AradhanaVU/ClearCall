import React, { useState, useEffect, useCallback } from 'react';
import { TranscriptEntry, Theme, CallLogEntry, Page, Contact } from './types';
import SpeechRecognition from './components/SpeechRecognition';
import CaptionDisplay from './components/CaptionDisplay';
import { ScamDetector } from './utils/ScamDetector';
import ThemeToggle from './components/ThemeToggle';
import ContactsPage from './components/ContactsPage';
import CallHistoryPage from './components/CallHistoryPage';
import CallTranscriptPage from './components/CallTranscriptPage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import JoinCallPage from './components/JoinCallPage';
import NavigationBar from './components/NavigationBar';
import CallInterface from './components/CallInterface';
import { themes } from './utils/themes';
import { scamKeywords } from './utils/scamKeywords';
import './App.css';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

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

  const handleInterimUpdate = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  // Load contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('clearcall-contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts).map((contact: any) => ({
          ...contact,
          lastCallDate: contact.lastCallDate ? new Date(contact.lastCallDate) : undefined,
          createdAt: new Date(contact.createdAt),
          updatedAt: new Date(contact.updatedAt)
        }));
        setContacts(parsedContacts);
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    } else {
      // Add sample contacts if none exist
      const sampleContacts: Contact[] = [
        {
          id: '1',
          name: 'Mom',
          phoneNumber: '+1 (555) 123-4567',
          email: 'mom@family.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalCalls: 15,
          scamWarnings: 0,
          notes: 'Family member - always safe to call',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Dad',
          phoneNumber: '+1 (555) 123-4568',
          email: 'dad@family.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          totalCalls: 8,
          scamWarnings: 0,
          notes: 'Family member - safe to call',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Sarah Johnson',
          phoneNumber: '+1 (555) 456-7890',
          email: 'sarah.j@company.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          totalCalls: 12,
          scamWarnings: 0,
          notes: 'Best friend from college',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'Mike Chen',
          phoneNumber: '+1 (555) 987-6543',
          email: 'mike.chen@techcorp.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          totalCalls: 8,
          scamWarnings: 0,
          notes: 'Work colleague - project manager',
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'Dr. Williams',
          phoneNumber: '+1 (555) 234-5678',
          email: 'dr.williams@clinic.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          totalCalls: 4,
          scamWarnings: 0,
          notes: 'Family doctor - legitimate medical calls',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '6',
          name: 'Emma Rodriguez',
          phoneNumber: '+1 (555) 345-6789',
          email: 'emma.r@email.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          totalCalls: 6,
          scamWarnings: 0,
          notes: 'Neighbor - book club friend',
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '7',
          name: 'Alex Thompson',
          phoneNumber: '+1 (555) 567-8901',
          email: 'alex.t@gym.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          totalCalls: 3,
          scamWarnings: 0,
          notes: 'Gym buddy - workout partner',
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '8',
          name: 'Lisa Park',
          phoneNumber: '+1 (555) 678-9012',
          email: 'lisa.park@restaurant.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          totalCalls: 2,
          scamWarnings: 0,
          notes: 'Restaurant owner - business contact',
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '9',
          name: 'James Wilson',
          phoneNumber: '+1 (555) 789-0123',
          email: 'james.w@bank.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          totalCalls: 1,
          scamWarnings: 0,
          notes: 'Bank representative - legitimate business',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '10',
          name: 'Maria Garcia',
          phoneNumber: '+1 (555) 890-1234',
          email: 'maria.g@school.edu',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          totalCalls: 5,
          scamWarnings: 0,
          notes: 'Teacher - child\'s school contact',
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '11',
          name: 'David Kim',
          phoneNumber: '+1 (555) 901-2345',
          email: 'david.k@delivery.com',
          isScamRisk: false,
          scamRiskLevel: 'low',
          scamReasons: [],
          lastCallDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalCalls: 7,
          scamWarnings: 0,
          notes: 'Delivery driver - regular service',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '12',
          name: 'Tech Support Scam',
          phoneNumber: '+1 (555) 999-8888',
          email: undefined,
          isScamRisk: true,
          scamRiskLevel: 'high',
          scamReasons: ['Claimed to be tech support', 'Asked for remote access', 'Urgent payment request'],
          lastCallDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          totalCalls: 1,
          scamWarnings: 8,
          notes: 'BLOCKED - Confirmed scammer',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '13',
          name: 'IRS Scam Caller',
          phoneNumber: '+1 (555) 000-0000',
          email: undefined,
          isScamRisk: true,
          scamRiskLevel: 'high',
          scamReasons: ['Claimed to be IRS', 'Demanded immediate payment', 'Threatened legal action'],
          lastCallDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalCalls: 3,
          scamWarnings: 12,
          notes: 'BLOCKED - IRS impersonation scam',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '14',
          name: 'Warranty Scam',
          phoneNumber: '+1 (555) 111-2222',
          email: undefined,
          isScamRisk: true,
          scamRiskLevel: 'medium',
          scamReasons: ['Car warranty offer', 'High-pressure sales tactics', 'Suspicious caller ID'],
          lastCallDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          totalCalls: 2,
          scamWarnings: 4,
          notes: 'BLOCKED - Warranty scam attempt',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '15',
          name: 'Unknown Caller',
          phoneNumber: '+1 (555) 333-4444',
          email: undefined,
          isScamRisk: true,
          scamRiskLevel: 'high',
          scamReasons: ['Suspicious call patterns', 'Requested personal information', 'Robocall detected'],
          lastCallDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalCalls: 5,
          scamWarnings: 6,
          notes: 'BLOCKED - Unknown suspicious caller',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];
      setContacts(sampleContacts);
      // Save sample contacts to localStorage immediately
      try {
        localStorage.setItem('clearcall-contacts', JSON.stringify(sampleContacts));
        console.log('Sample contacts saved to localStorage');
      } catch (error) {
        console.error('Error saving sample contacts:', error);
      }
    }
  }, []);

  const startCall = useCallback(() => {
    const callId = Date.now().toString();
    const startTime = new Date();
    setCurrentCallId(callId);
    setCallStartTime(startTime);
    setTranscript([]);
    setInterimText(''); // Clear any previous interim text
    setIsListening(true);
  }, []);

  const endCall = useCallback(() => {
    if (currentCallId && callStartTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - callStartTime.getTime()) / 1000);
      const totalScamWarnings = transcript.filter(entry => entry.isScamWarning).length;
      
      const callLogEntry: CallLogEntry = {
        id: currentCallId,
        startTime: callStartTime,
        endTime: endTime,
        duration: duration,
        transcript: [...transcript],
        totalScamWarnings,
        callerId: 'Recording Session',
        isScamCall: transcript.some(entry => entry.isScamWarning),
        callType: 'recording'
      };

      console.log('Saving call log entry:', callLogEntry);
      setCallLogs(prev => [callLogEntry, ...prev]);
    }
    
    setIsListening(false);
    setCurrentCallId(null);
    setCallStartTime(null);
    setInterimText(''); // Clear interim text when call ends
  }, [currentCallId, callStartTime, transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    setCallStartTime(null);
    setCurrentCallId(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme(prev => 
      prev.name === 'light' ? themes.dark : themes.light
    );
  }, []);

  const handleStartCall = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setShowCallInterface(true);
  }, []);

  const handleStopRecording = useCallback(() => {
    // Just stop the recording, keep the interface open
    setIsListening(false);
    // Don't call endCall() - keep the interface open for transcript review
  }, []);

  const handleStartRecording = useCallback(() => {
    // Start recording again without clearing existing transcript
    setIsListening(true);
  }, []);

  const handleEndCall = useCallback(() => {
    // Save the call log entry before closing
    endCall();
    setShowCallInterface(false);
    setSelectedContact(null);
    // Stay on current page instead of navigating to call history
  }, [endCall]);

  const handleBackFromCall = useCallback(() => {
    setShowCallInterface(false);
    setSelectedContact(null);
  }, []);

  return (
    <div className="app" style={{ 
      backgroundColor: currentTheme.backgroundColor,
      color: currentTheme.textColor,
      minHeight: '100vh'
    }}>
      {currentPage === 'home' && (
        <header className="app-header">
          <div className="header-content">
            <div className="title-container">
              <h1 className="app-title">ClearCall</h1>
              <span className="shield-icon">🛡️</span>
            </div>
            <p className="app-subtitle">Your call safety companion.</p>
            <p className="app-description">AI-powered scam detection and real-time call protection</p>
            <div className="header-controls">
              <ThemeToggle 
                currentTheme={currentTheme} 
                onToggle={toggleTheme} 
              />
            </div>
          </div>
        </header>
      )}

      <NavigationBar 
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          setShowCallInterface(false);
        }}
        theme={currentTheme}
      />

      {currentPage !== 'home' && !showCallInterface && (
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">
              {currentPage === 'joinCall' && 'Join Call'}
              {currentPage === 'contacts' && 'Contacts'}
              {currentPage === 'callHistory' && 'Call History'}
              {currentPage === 'callTranscript' && 'Call Transcript'}
              {currentPage === 'settings' && 'Settings'}
              {currentPage === 'help' && 'Help & Support'}
            </h1>
            <div className="page-controls">
              <ThemeToggle 
                currentTheme={currentTheme} 
                onToggle={toggleTheme} 
              />
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        {showCallInterface ? (
          <CallInterface 
            theme={currentTheme}
            onEndCall={handleEndCall}
            onStopRecording={handleStopRecording}
            onStartRecording={handleStartRecording}
            onBack={handleBackFromCall}
            isRecording={isListening}
            transcript={transcript}
            interimText={interimText}
          />
        ) : currentPage === 'home' && (
          <>
            <div className="home-content">
              <div className="home-actions">
                <div className="main-buttons">
                  <button 
                    className="place-call-button"
                    onClick={() => setShowCallInterface(true)}
                    style={{
                      backgroundColor: currentTheme.buttonColor,
                      color: currentTheme.buttonText
                    }}
                  >
                    <span className="button-icon">📞</span>
                    Join Call
                  </button>
                  
                  <SpeechRecognition
                    isListening={isListening}
                    onStart={() => {
                      startCall();
                      setShowCallInterface(true);
                    }}
                    onStop={handleStopRecording}
                    onTranscriptUpdate={handleTranscriptUpdate}
                    onInterimUpdate={handleInterimUpdate}
                    theme={currentTheme}
                  />
                </div>
                
                {transcript.length > 0 && (
                  <button 
                    className="clear-button"
                    onClick={clearTranscript}
                    style={{
                      backgroundColor: currentTheme.captionBackground,
                      color: currentTheme.textColor,
                      border: `1px solid ${currentTheme.buttonColor}`
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
            </div>
          </>
        )}
        
        {currentPage === 'contacts' && (
          <ContactsPage 
            theme={currentTheme}
            onStartCall={handleStartCall}
          />
        )}
        
        {currentPage === 'joinCall' && (
          <JoinCallPage 
            theme={currentTheme}
            onJoinCall={(callLink) => {
              // For now, just show an alert. In a real app, this would open the call
              alert(`Joining call: ${callLink}`);
            }}
          />
        )}
        
        {currentPage === 'callHistory' && (
          <CallHistoryPage 
            logs={callLogs}
            theme={currentTheme}
            onClearLogs={() => setCallLogs([])}
          />
        )}
        
        {currentPage === 'callTranscript' && (
          <CallTranscriptPage 
            theme={currentTheme}
          />
        )}
        
        {currentPage === 'settings' && (
          <SettingsPage 
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
        )}
        
        {currentPage === 'help' && (
          <HelpPage 
            theme={currentTheme}
          />
        )}
      </main>
    </div>
  );
};

export default App;
