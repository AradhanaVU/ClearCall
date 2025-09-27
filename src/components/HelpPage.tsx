import React, { useState } from 'react';
import { Theme } from '../types';
import './HelpPage.css';

interface HelpPageProps {
  theme: Theme;
}

const HelpPage: React.FC<HelpPageProps> = ({ theme }) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div>
          <h4>Welcome to ClearCall</h4>
          <p>ClearCall is an AI-powered scam detection tool that helps protect you from fraudulent phone calls by analyzing speech in real-time.</p>
          
          <h4>How to Use</h4>
          <ol>
            <li><strong>Start a Call:</strong> Click the microphone button to begin speech recognition</li>
            <li><strong>Speak Normally:</strong> The app will transcribe your conversation in real-time</li>
            <li><strong>Get Warnings:</strong> Potential scam keywords will be highlighted with warnings</li>
            <li><strong>Review Logs:</strong> Check your call history to see detailed transcripts and warnings</li>
          </ol>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      icon: '⭐',
      content: (
        <div>
          <h4>Core Features</h4>
          <ul>
            <li><strong>Real-time Speech Recognition:</strong> Converts your speech to text instantly</li>
            <li><strong>Scam Detection:</strong> Identifies potential scam keywords and phrases</li>
            <li><strong>Call Logging:</strong> Saves all your calls with detailed transcripts</li>
            <li><strong>Contact Management:</strong> Track contacts and mark potential scams</li>
            <li><strong>Theme Support:</strong> Light and dark themes for your preference</li>
          </ul>
          
          <h4>Scam Detection</h4>
          <p>Our AI analyzes speech patterns and identifies common scam tactics including:</p>
          <ul>
            <li>Urgent payment requests</li>
            <li>Personal information requests</li>
            <li>Threats and intimidation</li>
            <li>Too-good-to-be-true offers</li>
            <li>Impersonation attempts</li>
          </ul>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: (
        <div>
          <h4>Common Issues</h4>
          
          <h5>Speech Recognition Not Working</h5>
          <ul>
            <li>Check that your microphone is connected and working</li>
            <li>Ensure you've granted microphone permissions to the browser</li>
            <li>Try refreshing the page and allowing permissions again</li>
            <li>Check your internet connection</li>
          </ul>
          
          <h5>No Warnings Appearing</h5>
          <ul>
            <li>Make sure you're speaking clearly and at a normal volume</li>
            <li>Check that scam detection is enabled in settings</li>
            <li>Try adjusting the sensitivity level in settings</li>
          </ul>
          
          <h5>Call Logs Not Saving</h5>
          <ul>
            <li>Ensure auto-save is enabled in settings</li>
            <li>Check that your browser allows local storage</li>
            <li>Try clearing your browser cache and refreshing</li>
          </ul>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: '🔒',
      content: (
        <div>
          <h4>Your Privacy Matters</h4>
          <p>ClearCall is designed with privacy in mind:</p>
          
          <ul>
            <li><strong>Local Processing:</strong> Speech recognition happens in your browser</li>
            <li><strong>No Cloud Storage:</strong> Your data stays on your device</li>
            <li><strong>Secure Storage:</strong> Call logs are stored locally using browser storage</li>
            <li><strong>No Tracking:</strong> We don't collect or share your personal information</li>
          </ul>
          
          <h4>Data Storage</h4>
          <p>All your data is stored locally on your device:</p>
          <ul>
            <li>Call transcripts are saved in your browser's local storage</li>
            <li>Contact information is stored locally</li>
            <li>Settings and preferences are saved locally</li>
            <li>You can clear all data at any time</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: '❓',
      content: (
        <div>
          <h4>Frequently Asked Questions</h4>
          
          <h5>Is ClearCall free to use?</h5>
          <p>Yes, ClearCall is completely free to use with no hidden costs or subscriptions.</p>
          
          <h5>Does it work on mobile devices?</h5>
          <p>Yes, ClearCall works on both desktop and mobile browsers that support speech recognition.</p>
          
          <h5>Can I use it without an internet connection?</h5>
          <p>Speech recognition requires an internet connection, but your data is stored locally.</p>
          
          <h5>How accurate is the scam detection?</h5>
          <p>Our AI provides warnings based on known scam patterns, but it's not 100% accurate. Always use your judgment.</p>
          
          <h5>Can I export my call logs?</h5>
          <p>Currently, call logs are stored locally. We're working on export features for future updates.</p>
          
          <h5>What browsers are supported?</h5>
          <p>ClearCall works on Chrome, Firefox, Safari, and Edge browsers that support the Web Speech API.</p>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact & Support',
      icon: '📞',
      content: (
        <div>
          <h4>Get Help</h4>
          <p>Need more assistance? Here's how to reach us:</p>
          
          <h5>Support Channels</h5>
          <ul>
            <li><strong>Email:</strong> support@clearcall.app</li>
            <li><strong>GitHub:</strong> Report bugs and request features</li>
            <li><strong>Documentation:</strong> Check our online documentation</li>
          </ul>
          
          <h5>Report Issues</h5>
          <p>When reporting issues, please include:</p>
          <ul>
            <li>Your browser and version</li>
            <li>Operating system</li>
            <li>Steps to reproduce the problem</li>
            <li>Any error messages you see</li>
          </ul>
          
          <h5>Feature Requests</h5>
          <p>Have an idea for a new feature? We'd love to hear from you! Submit your suggestions through our GitHub repository.</p>
        </div>
      )
    }
  ];

  return (
    <div className="help-page" style={{ 
      backgroundColor: theme.backgroundColor,
      color: theme.textColor
    }}>
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>Everything you need to know about using ClearCall</p>
      </div>

      <div className="help-content">
        <div className="help-sidebar">
          <nav className="help-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
                style={{
                  backgroundColor: activeSection === section.id ? theme.buttonColor : 'transparent',
                  color: activeSection === section.id ? theme.buttonText : theme.textColor,
                  borderColor: activeSection === section.id ? theme.buttonColor : 'transparent'
                }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="help-main">
          <div className="help-section">
            <div className="section-content">
              {sections.find(s => s.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>

      <div className="help-footer">
        <div className="footer-content">
          <p><strong>ClearCall v1.0.0</strong> - AI-Powered Scam Detection</p>
          <p>Stay safe and protected from phone scams</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;