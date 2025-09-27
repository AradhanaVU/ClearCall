# ClearCall - Accessibility Phone Assistant

ClearCall is a React-based web application that provides real-time speech-to-text captions with scam detection for phone conversations. It's designed to help people who are hard of hearing or have auditory processing difficulties.

## Features

### Core Features (MVP)
- **Live Captioning**: Real-time speech-to-text using the Web Speech API
- **Scam Detection**: Highlights suspicious keywords and phrases like "gift cards," "urgent payment," "IRS," etc.
- **Accessible UI**: Large, readable captions with high-contrast themes
- **Dark/Light Mode**: Toggle between themes for better accessibility
- **Call Log**: Save and review transcripts of conversations
- **Export Functionality**: Download transcripts as text files

### Accessibility Features
- High contrast color schemes
- Large, readable fonts
- Screen reader support
- Keyboard navigation
- Reduced motion support
- Focus indicators

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with CSS custom properties
- **Speech Recognition**: Web Speech API (browser-native)
- **Storage**: LocalStorage for call logs
- **Build Tool**: Webpack 5

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern browser with Web Speech API support (Chrome, Edge, Safari)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clearcall
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Start Listening**: Click the "🎤 Start Listening" button to begin speech recognition
2. **View Captions**: Real-time captions will appear below the controls
3. **Scam Warnings**: Suspicious keywords will be highlighted in yellow and marked with warning badges
4. **Stop Listening**: Click "⏹️ Stop" to end the current session
5. **View History**: Click "Show Logs" to see your call history
6. **Export Transcripts**: Click "Export" on any call log to download the transcript

## Browser Compatibility

ClearCall works best in modern browsers that support the Web Speech API:
- Chrome 25+
- Edge 79+
- Safari 14.1+

**Note**: Firefox does not currently support the Web Speech API.

## Scam Detection

The application detects various types of scam keywords across multiple categories:

- **Financial**: urgent payment, wire transfer, bank account
- **Identity**: social security number, SSN
- **Payment**: gift cards, iTunes cards, Amazon cards
- **Government**: IRS, internal revenue service
- **Tech Support**: Microsoft support, remote access
- **Prize Scams**: lottery winner, congratulations
- **Family Emergency**: grandparent scam, bail money
- **Investment**: guaranteed returns, cryptocurrency
- **Pressure Tactics**: act now, don't tell anyone

## Privacy

- All speech processing happens locally in your browser
- No audio data is sent to external servers
- Call logs are stored locally on your device
- You can clear all data at any time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues or questions, please open an issue on the GitHub repository.
