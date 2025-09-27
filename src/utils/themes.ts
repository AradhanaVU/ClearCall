import { Theme } from '../types';

export const themes: { light: Theme; dark: Theme } = {
  light: {
    name: 'light',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    captionBackground: '#f8f9fa',
    captionText: '#1a1a1a',
    warningColor: '#dc3545',
    buttonColor: '#007bff',
    buttonText: '#ffffff'
  },
  dark: {
    name: 'dark',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    captionBackground: '#2d2d2d',
    captionText: '#ffffff',
    warningColor: '#ff6b6b',
    buttonColor: '#4dabf7',
    buttonText: '#1a1a1a'
  }
};
