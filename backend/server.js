const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Check if Gemini API key is loaded
const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('🔍 Environment check:');
console.log('- GEMINI_API_KEY exists:', !!geminiApiKey);
console.log('- GEMINI_API_KEY length:', geminiApiKey ? geminiApiKey.length : 0);
console.log('- GEMINI_API_KEY preview:', geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'undefined');

if (!geminiApiKey) {
  console.error('❌ GEMINI_API_KEY is not set in the .env file.');
  console.log('Please check your .env file contains: GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

console.log('✅ Gemini API key loaded successfully');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Store active conversations
const activeConversations = new Map();

// Enhanced scam detection with Gemini (with fallback)
async function analyzeWithGemini(text, conversationId) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    Analyze this conversation text for potential scams or suspicious activity. Consider:
    1. Financial urgency or pressure tactics
    2. Requests for personal information
    3. Unusual payment methods (gift cards, wire transfers)
    4. Government impersonation
    5. Tech support scams
    6. Emotional manipulation
    7. Social engineering tactics
    
    Text: "${text}"
    
    Respond with a JSON object containing:
    {
      "riskLevel": "low" | "medium" | "high",
      "riskScore": 0-100,
      "suspiciousElements": ["list", "of", "suspicious", "elements"],
      "explanation": "detailed explanation of why this is suspicious",
      "recommendations": ["list", "of", "recommendations"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());
    
    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error.message);
    
    // Fallback to basic keyword detection
    const scamKeywords = [
      'social security', 'ssn', 'credit card', 'bank account', 'password',
      'gift card', 'wire transfer', 'urgent', 'immediately', 'act now',
      'limited time', 'free money', 'lottery', 'inheritance', 'tax refund',
      'microsoft', 'apple', 'tech support', 'virus', 'hacked'
    ];
    
    const lowerText = text.toLowerCase();
    const foundKeywords = scamKeywords.filter(keyword => lowerText.includes(keyword));
    
    let riskLevel = 'low';
    let riskScore = 0;
    
    if (foundKeywords.length > 0) {
      riskLevel = foundKeywords.length > 2 ? 'high' : 'medium';
      riskScore = Math.min(foundKeywords.length * 20, 100);
    }
    
    return {
      riskLevel,
      riskScore,
      suspiciousElements: foundKeywords,
      explanation: foundKeywords.length > 0 
        ? `Detected ${foundKeywords.length} suspicious keywords: ${foundKeywords.join(', ')}`
        : 'No obvious scam indicators detected',
      recommendations: foundKeywords.length > 0 
        ? ['Be cautious', 'Do not provide personal information', 'Verify the caller\'s identity']
        : ['Continue monitoring the conversation']
    };
  }
}

// Real-time conversation summarization
async function generateSummary(conversationHistory, conversationId) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    Create a concise summary of this conversation. Focus on:
    1. Key topics discussed
    2. Important decisions or agreements
    3. Action items or next steps
    4. Important details (dates, amounts, names)
    
    Conversation history: ${conversationHistory.join('\n')}
    
    Respond with a JSON object:
    {
      "summary": "brief summary of the conversation",
      "keyPoints": ["list", "of", "key", "points"],
      "actionItems": ["list", "of", "action", "items"],
      "importantDetails": {
        "dates": ["list", "of", "dates"],
        "amounts": ["list", "of", "amounts"],
        "names": ["list", "of", "names"]
      }
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = JSON.parse(response.text());
    
    return summary;
  } catch (error) {
    console.error('Summary generation error:', error.message);
    
    // Fallback to basic summary
    const messageCount = conversationHistory.length;
    const recentMessages = conversationHistory.slice(-3).join(' ');
    
    return {
      summary: `Conversation with ${messageCount} messages. Recent topics: ${recentMessages.substring(0, 100)}...`,
      keyPoints: [
        `Total messages: ${messageCount}`,
        'Conversation monitoring active',
        'Scam detection enabled'
      ],
      actionItems: [
        'Continue monitoring for suspicious activity',
        'Review conversation logs if needed'
      ],
      importantDetails: {
        dates: [],
        amounts: [],
        names: []
      }
    };
  }
}

// API Routes
app.post('/api/analyze-text', async (req, res) => {
  try {
    const { text, conversationId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Analyze with Gemini
    const analysis = await analyzeWithGemini(text, conversationId);
    
    // Store in conversation history
    if (conversationId) {
      if (!activeConversations.has(conversationId)) {
        activeConversations.set(conversationId, {
          messages: [],
          summaries: [],
          analysisHistory: []
        });
      }
      
      const conversation = activeConversations.get(conversationId);
      conversation.messages.push({
        text,
        timestamp: new Date(),
        analysis
      });
      conversation.analysisHistory.push(analysis);
    }

    res.json({
      success: true,
      analysis,
      conversationId
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.post('/api/generate-summary', async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID required' });
    }

    // Create conversation if it doesn't exist
    if (!activeConversations.has(conversationId)) {
      activeConversations.set(conversationId, {
        id: conversationId,
        messages: [],
        analysisHistory: [],
        summaries: [],
        createdAt: new Date()
      });
      console.log(`📝 Created new conversation: ${conversationId}`);
    }

    const conversation = activeConversations.get(conversationId);
    const conversationHistory = conversation.messages.map(msg => msg.text);
    
    // If no messages, create a basic summary
    if (conversationHistory.length === 0) {
      const basicSummary = {
        summary: "No conversation data available for summary generation.",
        keyPoints: ["No messages recorded"],
        actionItems: ["Start a conversation to generate meaningful insights"],
        importantDetails: {
          dates: [],
          amounts: [],
          names: []
        }
      };
      
      conversation.summaries.push({
        ...basicSummary,
        timestamp: new Date()
      });

      return res.json({
        success: true,
        summary: basicSummary,
        conversationId
      });
    }
    
    const summary = await generateSummary(conversationHistory, conversationId);
    
    // Store summary
    conversation.summaries.push({
      ...summary,
      timestamp: new Date()
    });

    res.json({
      success: true,
      summary,
      conversationId
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Summary generation failed' });
  }
});

app.get('/api/conversation/:id', (req, res) => {
  const conversationId = req.params.id;
  const conversation = activeConversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({
    success: true,
    conversation: {
      id: conversationId,
      messageCount: conversation.messages.length,
      summaries: conversation.summaries,
      analysisHistory: conversation.analysisHistory
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    activeConversations: activeConversations.size
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 ClearCall Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`📞 Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle incoming calls from scammer interface
  socket.on('incoming-call', (data) => {
    console.log('📞 Incoming call:', data);
    console.log('📞 Broadcasting to accessibility room...');
    // Broadcast to all clients in the accessibility room
    socket.to('accessibility').emit('incoming-call', data);
    // Also emit to the caller to confirm
    socket.emit('call-initiated', data);
    console.log('📞 Call broadcasted to accessibility room');
  });

  // Handle call acceptance
  socket.on('accept-call', (data) => {
    console.log('✅ Call accepted:', data);
    console.log('📞 Broadcasting call-accepted to accessibility room...');
    socket.to('accessibility').emit('call-accepted', data);
    // Also emit to the caller to confirm
    socket.emit('call-accepted', data);
    console.log('📞 Call-accepted event broadcasted');
  });

  // Handle call rejection
  socket.on('reject-call', (data) => {
    console.log('❌ Call rejected:', data);
    socket.to('accessibility').emit('call-rejected', data);
  });

  // Handle call ending
  socket.on('end-call', (data) => {
    console.log('📞 Call ended:', data);
    console.log('📞 Broadcasting call-ended to accessibility room...');
    socket.to('accessibility').emit('call-ended', data);
    // Also emit to the caller to confirm
    socket.emit('call-ended', data);
    console.log('📞 Call-ended event broadcasted');
  });

  // Handle WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    console.log('📡 WebRTC offer received');
    socket.to('accessibility').emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    console.log('📡 WebRTC answer received');
    socket.to('accessibility').emit('webrtc-answer', data);
  });

  socket.on('webrtc-candidate', (data) => {
    console.log('📡 WebRTC candidate received');
    socket.to('accessibility').emit('webrtc-candidate', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Export for testing
module.exports = { app, io, analyzeWithGemini, generateSummary };