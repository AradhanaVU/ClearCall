# ClearCall Demo Script

## Quick Start
1. Run `npm start` to start the development server
2. Open http://localhost:3000 in Chrome, Edge, or Safari
3. Allow microphone permissions when prompted

## Testing Scam Detection
Try saying these phrases to test the scam detection:

### High Risk Phrases:
- "You need to make an urgent payment immediately"
- "Buy gift cards and give me the codes"
- "This is the IRS calling about your tax debt"
- "I need your social security number"
- "Wire transfer the money to this account"

### Medium Risk Phrases:
- "You have won a lottery prize"
- "Microsoft support needs remote access"
- "Investment opportunity with guaranteed returns"
- "Act now before it's too late"

### Low Risk Phrases:
- "Congratulations on your purchase"
- "Bitcoin investment opportunity"
- "Grandma needs help"

## Features to Test:
1. **Speech Recognition**: Click "Start Listening" and speak clearly
2. **Scam Detection**: Notice yellow highlighting and warning badges
3. **Theme Toggle**: Switch between light and dark modes
4. **Call Logs**: End a session and view "Show Logs"
5. **Export**: Export transcripts as text files
6. **Responsive Design**: Test on different screen sizes

## Browser Compatibility:
- ✅ Chrome 25+ (Recommended)
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (No Web Speech API support)

## Troubleshooting:
- **No speech detected**: Check microphone permissions
- **Poor accuracy**: Speak clearly and reduce background noise
- **Not working**: Ensure you're using a supported browser
