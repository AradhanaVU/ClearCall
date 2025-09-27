import { Theme } from '../types';

export const themes: { light: Theme; dark: Theme } = {
  light: {
    name: 'light',
    backgroundColor: '#f8fafc',
    textColor: '#1e3a8a',
    captionBackground: '#f1f5f9',
    captionText: '#1e3a8a',
    warningColor: '#dc2626',
    buttonColor: '#2563eb',
    buttonText: '#ffffff'
  },
  dark: {
    name: 'dark',
    backgroundColor: '#374151',
    textColor: '#f3f4f6',
    captionBackground: '#4b5563',
    captionText: '#f3f4f6',
    warningColor: '#ef4444',
    buttonColor: '#6b7280',
    buttonText: '#ffffff'
  }
};
