import React from 'react';
import { Theme } from '../types';
import './ThemeToggle.css';

interface ThemeToggleProps {
  currentTheme: Theme;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${currentTheme.name === 'light' ? 'dark' : 'light'} theme`}
    >
      {currentTheme.name === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
