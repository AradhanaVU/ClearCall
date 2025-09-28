import React, { useState } from 'react';
import io from 'socket.io-client';

const ScammerKeypad: React.FC = () => {
  const [currentNumber, setCurrentNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [status, setStatus] = useState('Ready to dial');

  const addDigit = (digit: string) => {
    if (isInCall) return;
    
    if (currentNumber.length < 15) {
      setCurrentNumber(prev => prev + digit);
    }
  };

  const clearDisplay = () => {
    if (isInCall) return;
    setCurrentNumber('');
    setStatus('Ready to dial');
  };

  const makeCall = async () => {
    if (isInCall) {
      // End call
      endCall();
      return;
    }
    
    if (!currentNumber || currentNumber === '') {
      setStatus('Please enter a number first');
      return;
    }

    setIsInCall(true);
    setStatus('Initiating call...');
    
    try {
      const socket = io('http://localhost:3001');
      
      // Emit incoming call event
      socket.emit('incoming-call', { 
        phoneNumber: currentNumber,
        callId: 'accessibility'
      });
      
      setStatus(`Calling ${currentNumber}...`);
      
      // Listen for call events
      socket.on('call-accepted', () => {
        setStatus('Call accepted! Connected.');
      });
      
      socket.on('call-rejected', () => {
        setStatus('Call was rejected');
        resetCallState();
      });
      
      socket.on('call-ended', () => {
        endCall();
      });
      
    } catch (err) {
      console.error('Error making call:', err);
      setStatus('Error making call');
      resetCallState();
    }
  };

  const endCall = () => {
    setIsInCall(false);
    setStatus('Call ended');
    setTimeout(() => setStatus('Ready to dial'), 2000);
  };

  const resetCallState = () => {
    setIsInCall(false);
    setTimeout(() => setStatus('Ready to dial'), 2000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key;
    if (key >= '0' && key <= '9') {
      addDigit(key);
    } else if (key === '*' || key === '#') {
      addDigit(key);
    } else if (key === 'Enter') {
      makeCall();
    } else if (key === 'Backspace' && !isInCall) {
      if (currentNumber.length > 0) {
        setCurrentNumber(prev => prev.slice(0, -1));
      }
    } else if (key === 'Escape') {
      if (isInCall) {
        endCall();
      } else {
        clearDisplay();
      }
    }
  };

  return (
    <div 
      style={{ textAlign: 'center' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Display */}
      <div style={{
        background: '#2c3e50',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        letterSpacing: '2px',
        minHeight: '30px',
        border: '2px solid #34495e',
        color: '#ecf0f1'
      }}>
        {currentNumber || 'Enter number'}
      </div>
      
      {/* Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((key) => (
          <button
            key={key}
            onClick={() => addDigit(key.toString())}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2980b9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3498db';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {key}
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={clearDisplay}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: '#e74c3c',
            color: 'white'
          }}
        >
          Clear
        </button>
        <button
          onClick={makeCall}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: isInCall ? '#e74c3c' : '#27ae60',
            color: 'white'
          }}
        >
          {isInCall ? '📞 End' : '📞 Call'}
        </button>
      </div>
      
      {/* Status */}
      <div style={{
        marginTop: '15px',
        fontSize: '0.9rem',
        color: '#bdc3c7',
        minHeight: '20px'
      }}>
        {status}
      </div>
    </div>
  );
};

export default ScammerKeypad;