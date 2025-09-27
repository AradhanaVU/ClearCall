import React from 'react';
import { Page, NavigationItem, Theme } from '../types';
import './NavigationBar.css';

interface NavigationBarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  theme: Theme;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    description: 'Main call screen with speech recognition'
  },
  {
    id: 'joinCall',
    label: 'Join Call',
    icon: '🔗',
    description: 'Join an existing call with a link'
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: '📞',
    description: 'Manage your contacts and scam risk tracking'
  },
  {
    id: 'callHistory',
    label: 'Call History',
    icon: '📋',
    description: 'View detailed call logs and transcripts'
  },
  {
    id: 'callTranscript',
    label: 'Call Transcript',
    icon: '📝',
    description: 'View and manage call transcripts'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'Configure app preferences and themes'
  },
  {
    id: 'help',
    label: 'Help',
    icon: '❓',
    description: 'Get help and learn about the app'
  }
];

const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage, onPageChange, theme }) => {
  return (
    <nav className="navigation-bar" style={{ backgroundColor: theme.captionBackground }}>
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-title">ClearCall</span>
        </div>
        
        <div className="nav-items">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              style={{
                backgroundColor: currentPage === item.id ? theme.buttonColor : 'transparent',
                color: currentPage === item.id ? theme.buttonText : theme.textColor,
                borderColor: currentPage === item.id ? theme.buttonColor : 'transparent'
              }}
              title={item.description}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;