# ClearCall Backend

Backend service for ClearCall that integrates with Google's Gemini API to provide enhanced scam detection and conversation analysis.

## Features

- **Enhanced Scam Detection**: AI-powered analysis using Gemini API
- **Real-time Summarization**: Live conversation summaries and key point extraction
- **WebSocket Support**: Real-time updates to frontend
- **Conversation Management**: Track and analyze ongoing conversations

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Get Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env` file

4. **Start the server**:
   ```bash
   npm start
   ```

## API Endpoints

### POST `/api/analyze-text`
Analyze text for scam detection using Gemini AI.

**Request**:
```json
{
  "text": "You need to send gift cards immediately",
  "conversationId": "unique-conversation-id"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "riskLevel": "high",
    "riskScore": 85,
    "suspiciousElements": ["gift cards", "immediate payment"],
    "explanation": "This contains classic scam indicators...",
    "recommendations": ["Do not send gift cards", "Verify caller identity"]
  },
  "conversationId": "unique-conversation-id"
}
```

### POST `/api/generate-summary`
Generate a summary of the conversation.

**Request**:
```json
{
  "conversationId": "unique-conversation-id"
}
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "summary": "Brief conversation summary",
    "keyPoints": ["Key point 1", "Key point 2"],
    "actionItems": ["Action item 1", "Action item 2"],
    "importantDetails": {
      "dates": ["2024-01-01"],
      "amounts": ["$500"],
      "names": ["John Doe"]
    }
  },
  "conversationId": "unique-conversation-id"
}
```

### GET `/api/conversation/:id`
Get conversation details and history.

### GET `/api/health`
Health check endpoint.

## WebSocket Events

- **Connection**: Client connects to server
- **join-conversation**: Join a specific conversation room
- **Real-time updates**: Server sends analysis results and summaries

## Development

```bash
# Install nodemon for development
npm install -g nodemon

# Run in development mode
npm run dev
```

## Integration with Frontend

The backend is designed to work with the ClearCall React frontend:

1. Frontend sends speech-to-text results to `/api/analyze-text`
2. Backend processes with Gemini API
3. Results sent back via WebSocket for real-time updates
4. Frontend displays enhanced warnings and insights