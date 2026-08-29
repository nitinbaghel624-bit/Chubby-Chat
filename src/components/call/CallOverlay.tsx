import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useCall } from '../../context/CallContext';

export const CallOverlay: React.FC = () => {
  const {
    activeCall,
    callDuration,
    toggleMute,
    toggleVideo,
    acceptCall,
    endCall,
  } = useCall();

  if (!activeCall) return null;

  const targetUser = activeCall.recipient;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl select-none">
        {/* Main Calling Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg h-[80vh] max-h-[700px] mx-4 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col justify-between p-8 text-center text-white"
        >
          {/* Top Status */}
          <div className="flex flex-col items-center gap-1 z-10">
            <span className="text-xs uppercase tracking-widest text-pink-400 font-bold">
              {activeCall.type === 'video' ? 'Chubby Video Call' : 'Chubby Voice Call'}
            </span>
            <span className="text-xs text-zinc-400">
              {activeCall.status === 'ringing'
                ? 'Ringing...'
                : formatDuration(callDuration)}
            </span>
          </div>

          {/* Center Call Visual / Video Stage */}
          <div className="flex flex-col items-center justify-center gap-6 my-auto z-10">
            {!activeCall.isVideoOff && activeCall.status === 'connected' ? (
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
                {/* Simulated WebRTC Remote Video Feed */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt="Remote participant"
                  className="w-full h-full object-cover"
                />
                {/* Local Picture-in-Picture Preview */}
                <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
                    alt="Self camera"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                {/* Animated Pulsing Ring */}
                {activeCall.status === 'ringing' && (
                  <div className="absolute -inset-4 rounded-full bg-pink-500/20 animate-ping" />
                )}
                <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 shadow-2xl">
                  <Avatar src={targetUser?.avatar} size="2xl" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mt-4">
                  {targetUser?.displayName}
                </h3>
                <span className="text-sm text-zinc-400">@{targetUser?.username}</span>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-center gap-6 z-10">
            {activeCall.status === 'ringing' ? (
              <>
                {/* Decline */}
                <button
                  onClick={endCall}
                  className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

                {/* Accept */}
                <button
                  onClick={acceptCall}
                  className="p-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl animate-bounce active:scale-95 transition-transform"
                >
                  <Phone className="w-7 h-7" />
                </button>
              </>
            ) : (
              <>
                {/* Mute Mic */}
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full backdrop-blur-md transition-colors ${
                    activeCall.isMuted
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
                  }`}
                  title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Video Camera Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full backdrop-blur-md transition-colors ${
                    activeCall.isVideoOff
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
                  }`}
                  title={activeCall.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>

                {/* End Call */}
                <button
                  onClick={endCall}
                  className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl active:scale-95 transition-transform"
                  title="End Call"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
