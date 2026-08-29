import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ActiveCall, User } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { sounds } from '../utils/audio';

interface CallContextType {
  activeCall: ActiveCall | null;
  callDuration: number;
  startCall: (recipient: User, type: 'voice' | 'video') => void;
  acceptCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  toggleMinimize: () => void;
  localStream: MediaStream | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const durationTimerRef = useRef<any>(null);
  const autoConnectTimerRef = useRef<any>(null);

  useEffect(() => {
    if (activeCall?.status === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      if (activeCall?.status !== 'ringing') {
        setCallDuration(0);
      }
    }

    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeCall?.status]);

  const startCall = async (recipient: User, type: 'voice' | 'video') => {
    if (!currentUser) return;

    sounds.startRingtone();

    // Attempt to acquire media stream if video is requested
    let stream: MediaStream | null = null;
    if (type === 'video' && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.warn('Could not access camera/mic:', err);
      }
    }

    const newCall: ActiveCall = {
      id: `call-${Date.now()}`,
      conversationId: `conv-${recipient.id}`,
      caller: currentUser,
      recipient,
      type,
      status: 'ringing',
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true,
      isMinimized: false,
    };

    setActiveCall(newCall);

    // Auto connect simulation after 3.5 seconds
    autoConnectTimerRef.current = setTimeout(() => {
      sounds.stopRingtone();
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startedAt: new Date().toISOString() } : null));
      showToast(`Call connected with ${recipient.displayName} 📞`);
    }, 3500);
  };

  const acceptCall = () => {
    sounds.stopRingtone();
    if (autoConnectTimerRef.current) clearTimeout(autoConnectTimerRef.current);
    setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startedAt: new Date().toISOString() } : null));
  };

  const endCall = () => {
    sounds.stopRingtone();
    if (autoConnectTimerRef.current) clearTimeout(autoConnectTimerRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }

    setActiveCall(null);
    setCallDuration(0);
    showToast('Call ended.');
  };

  const toggleMute = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleVideo = () => {
    setActiveCall((prev) => (prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null));
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleSpeaker = () => {
    setActiveCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null));
  };

  const toggleMinimize = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMinimized: !prev.isMinimized } : null));
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callDuration,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleSpeaker,
        toggleMinimize,
        localStream,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};
