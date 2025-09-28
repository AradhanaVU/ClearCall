import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:5000';
const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

const JoinCall: React.FC = () => {
  const { callId } = useParams();
  const [socket, setSocket] = useState<any>(null);
  const [status, setStatus] = useState('connecting');
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const newSocket = io(SIGNALING_SERVER_URL);
    setSocket(newSocket);

    let localStream: MediaStream;
    let peerConnection: RTCPeerConnection;

    const start = async () => {
      setStatus('requesting media');
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
        }
        setStatus('media granted');
      } catch (err) {
        setStatus('media denied');
        return;
      }

      peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionRef.current = peerConnection;
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          newSocket.emit('webrtc-candidate', { callId, candidate: event.candidate });
        }
      };

      newSocket.emit('join-call', { callId, userType: 'guest' });
    };

    start();

    newSocket.on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit }) => {
      setStatus('received offer');
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      newSocket.emit('webrtc-answer', { callId, answer });
      setStatus('sent answer');
    });

    newSocket.on('webrtc-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          // ignore
        }
      }
    });

    return () => {
      newSocket.disconnect();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callId]);

  return (
    <div className="join-call">
      <h1>ClearCall</h1>
      <p>You're joining a call...</p>
      <p>Status: {status}</p>
      <audio ref={localAudioRef} muted autoPlay />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default JoinCall;