const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate Twilio token for client
router.post('/token', (req, res) => {
  try {
    const { identity } = req.body;
    
    const capability = new twilio.jwt.ClientCapability({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    });

    capability.addScope(new twilio.jwt.ClientCapability.OutgoingClientScope({}));
    capability.addScope(new twilio.jwt.ClientCapability.IncomingClientScope(identity));

    res.json({
      token: capability.toJwt(),
      identity: identity
    });
  } catch (error) {
    console.error('Token error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Make an outbound call
router.post('/call', async (req, res) => {
  try {
    const { to, from = process.env.TWILIO_PHONE_NUMBER } = req.body;

    const call = await client.calls.create({
      url: `${process.env.SERVER_URL || 'http://localhost:3001'}/twilio/voice`,
      to: to,
      from: from,
      method: 'POST'
    });

    res.json({ 
      success: true, 
      callSid: call.sid,
      message: 'Call initiated successfully'
    });
  } catch (error) {
    console.error('Call error:', error);
    res.status(500).json({ error: error.message });
  }
});

// TwiML for incoming call handling
router.post('/voice', (req, res) => {
  const response = new VoiceResponse();
  
  // Connect the call to your website
  const dial = response.dial();
  dial.client('website_user'); // This connects to your React app
  
  res.type('text/xml');
  res.send(response.toString());
});

// Webhook for call status updates
router.post('/status', (req, res) => {
  console.log('Call status update:', req.body);
  res.status(200).send('OK');
});

module.exports = router;