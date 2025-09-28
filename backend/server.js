const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const NGROK_URL = "https://nonextraneous-unsavage-natividad.ngrok-free.dev";

const io = socketIo(server, {
  cors: {
    origin: NGROK_URL,
    methods: ["GET", "POST"]
  }
});

// Store active calls
const activeCalls = new Map();
const FIXED_ACCESSIBILITY_ROOM = 'accessibility';

// Middleware
app.use(cors({
  origin: NGROK_URL,
  credentials: true,
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'ClearCall WebRTC Server', url: NGROK_URL });
});

// Serve scammer waiting room page as a real WebRTC client
app.get('/scammer-room', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/scammer-room.html'));
});

// Socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a call room
  socket.on('join-call', (data) => {
    const { callId, userType } = data;
    
    socket.join(callId);
    socket.callId = callId;
    socket.userType = userType;

    // Initialize room if it doesn't exist
    if (!activeCalls.has(callId)) {
      activeCalls.set(callId, {
        id: callId,
        createdAt: new Date(),
        participants: []
      });
    }

    const call = activeCalls.get(callId);
    call.participants.push({
      socketId: socket.id,
      userType: userType,
      joinedAt: new Date()
    });

    console.log(`User ${socket.id} joined call ${callId} as ${userType}`);

    // Notify other participants
    socket.to(callId).emit('user-joined', {
      socketId: socket.id,
      userType: userType
    });


    // Send confirmation to guest (scammer)
    if (userType === 'guest') {
      socket.emit('call-connected', { callId: callId });
      // Notify host to start the call
      const hostSocket = call.participants.find(p => p.userType === 'host');
      if (hostSocket) {
        io.to(hostSocket.socketId).emit('guest-ready', { callId });
      }
    }

    // Send call info to the new user
    socket.emit('call-info', {
      callId: callId,
      participants: call.participants.length
    });
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(data.callId).emit('webrtc-offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.callId).emit('webrtc-answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('webrtc-candidate', (data) => {
    socket.to(data.callId).emit('webrtc-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Audio transcription from accessibility user
  socket.on('transcription-data', (data) => {
    if (socket.userType === 'host') {
      socket.to(data.callId).emit('transcription-update', {
        text: data.text,
        isScamWarning: data.isScamWarning,
        scamKeywords: data.scamKeywords,
        timestamp: new Date()
      });

      socket.emit('own-transcription', {
        text: data.text,
        isScamWarning: data.isScamWarning,
        scamKeywords: data.scamKeywords,
        timestamp: new Date()
      });
    }
  });

  // Call controls
  socket.on('mute-audio', (data) => {
    socket.to(data.callId).emit('user-muted', { socketId: socket.id });
  });

  socket.on('unmute-audio', (data) => {
    socket.to(data.callId).emit('user-unmuted', { socketId: socket.id });
  });

  // End call
  socket.on('end-call', (data) => {
    socket.to(data.callId).emit('call-ended', { reason: 'Call ended by other party' });
  });

  // Handle incoming call from scammer dialer
  socket.on('incoming-call', (data) => {
    const { phoneNumber, callId } = data;
    console.log(`Incoming call from ${phoneNumber} to ${callId}`);
    
    // Join the caller to the room
    socket.join(callId);
    socket.callId = callId;
    socket.userType = 'caller';
    socket.phoneNumber = phoneNumber;

    // Initialize room if it doesn't exist
    if (!activeCalls.has(callId)) {
      activeCalls.set(callId, {
        id: callId,
        createdAt: new Date(),
        participants: []
      });
    }

    const call = activeCalls.get(callId);
    call.participants.push({
      socketId: socket.id,
      userType: 'caller',
      phoneNumber: phoneNumber,
      joinedAt: new Date()
    });

    // Notify all users in the room about the incoming call
    socket.to(callId).emit('incoming-call-notification', {
      phoneNumber: phoneNumber,
      callId: callId,
      timestamp: new Date()
    });

    // Send confirmation back to caller
    socket.emit('call-initiated', { 
      callId: callId, 
      phoneNumber: phoneNumber 
    });
  });

  // Handle call acceptance
  socket.on('accept-call', (data) => {
    const { callId } = data;
    console.log(`Call ${callId} accepted by ${socket.id}`);
    
    // Notify the caller that call was accepted
    socket.to(callId).emit('call-accepted', { callId });
    
    // Start WebRTC negotiation
    socket.to(callId).emit('start-webrtc', { callId });
  });

  // Handle call rejection
  socket.on('reject-call', (data) => {
    const { callId } = data;
    console.log(`Call ${callId} rejected by ${socket.id}`);
    
    // Notify the caller that call was rejected
    socket.to(callId).emit('call-rejected', { callId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.callId) {
      socket.to(socket.callId).emit('user-left', { socketId: socket.id });
      
      const call = activeCalls.get(socket.callId);
      if (call) {
        call.participants = call.participants.filter(p => p.socketId !== socket.id);
        if (call.participants.length === 0) {
          activeCalls.delete(socket.callId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ClearCall WebRTC Server Started');
  console.log(`✅ Port: ${PORT}`);
  console.log(`🌐 Ngrok URL: ${NGROK_URL}`);
  console.log(`🔗 Scammer Room: ${NGROK_URL}/scammer-room`);
});