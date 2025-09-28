import React from 'react';
import { Theme } from '../types';

interface CallInterfaceProps {
  isListening: boolean;
  onStartCall: (phoneNumber: string) => Promise<void>;
  onEndCall: () => void;
  onTranscriptUpdate: (text: string) => void;
  theme: Theme;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ theme }) => {
  return (
    <div style={{ backgroundColor: theme.backgroundColor, padding: '20px', borderRadius: '8px' }}>
      <div style={{ color: theme.textColor, textAlign: 'center' }}>
        <h3> ClearCall Ready</h3>
        <p>Waiting for incoming calls...</p>
      </div>
    </div>
  );
};

export default CallInterface;
