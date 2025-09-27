import React, { useState } from 'react';
import { Theme } from '../types';
import { themes } from '../utils/themes';
import './SettingsPage.css';

interface SettingsPageProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentTheme, onThemeChange }) => {
  const [settings, setSettings] = useState({
    autoStart: false,
    soundEnabled: true,
    notifications: true,
    scamDetectionSensitivity: 'medium' as 'low' | 'medium' | 'high',
    maxTranscriptLength: 1000,
    autoSaveLogs: true,
    logRetentionDays: 30
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (themeName: string) => {
    const newTheme = themeName === 'light' ? themes.light : themes.dark;
    onThemeChange(newTheme);
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        autoStart: false,
        soundEnabled: true,
        notifications: true,
        scamDetectionSensitivity: 'medium',
        maxTranscriptLength: 1000,
        autoSaveLogs: true,
        logRetentionDays: 30
      });
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <p>Configure your ClearCall preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sections">
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label>Theme</label>
              <div className="theme-options">
                <label className="theme-option">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={currentTheme.name === 'light'}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  />
                  <span className="theme-preview light">
                    <span className="theme-icon">☀️</span>
                    Light
                  </span>
                </label>
                <label className="theme-option">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={currentTheme.name === 'dark'}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  />
                  <span className="theme-preview dark">
                    <span className="theme-icon">🌙</span>
                    Dark
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Call Detection</h3>
            <div className="setting-item">
              <label>Scam Detection Sensitivity</label>
              <select
                value={settings.scamDetectionSensitivity}
                onChange={(e) => handleSettingChange('scamDetectionSensitivity', e.target.value)}
                style={{
                  backgroundColor: currentTheme.captionBackground,
                  color: currentTheme.textColor,
                  border: `1px solid ${currentTheme.buttonColor}`
                }}
              >
                <option value="low">Low - Fewer warnings</option>
                <option value="medium">Medium - Balanced</option>
                <option value="high">High - More warnings</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Auto-start Detection</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.autoStart ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Audio & Notifications</h3>
            <div className="setting-item">
              <label>Sound Effects</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.soundEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
            
            <div className="setting-item">
              <label>Notifications</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.notifications ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Data & Storage</h3>
            <div className="setting-item">
              <label>Max Transcript Length</label>
              <div className="range-input">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={settings.maxTranscriptLength}
                  onChange={(e) => handleSettingChange('maxTranscriptLength', parseInt(e.target.value))}
                />
                <span className="range-value">{settings.maxTranscriptLength} characters</span>
              </div>
            </div>
            
            <div className="setting-item">
              <label>Auto-save Call Logs</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSaveLogs}
                  onChange={(e) => handleSettingChange('autoSaveLogs', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.autoSaveLogs ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
            
            <div className="setting-item">
              <label>Log Retention (Days)</label>
              <select
                value={settings.logRetentionDays}
                onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e.target.value))}
                style={{
                  backgroundColor: currentTheme.captionBackground,
                  color: currentTheme.textColor,
                  border: `1px solid ${currentTheme.buttonColor}`
                }}
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="-1">Forever</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>About</h3>
            <div className="about-info">
              <p><strong>ClearCall</strong> - AI-Powered Scam Detection & Call Protection</p>
              <p>Version 1.0.0</p>
              <p>Real-time speech analysis to identify and warn against potential phone scams.</p>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="reset-button"
            onClick={resetSettings}
            style={{
              backgroundColor: '#ff8800',
              color: 'white'
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;