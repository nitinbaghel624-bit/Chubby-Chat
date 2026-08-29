import React, { useState, useRef } from 'react';
import {
  Send,
  Image,
  Mic,
  Smile,
  X,
  Sparkles,
  Paperclip,
  Square,
} from 'lucide-react';
import { Message } from '../../types';
import { useChat } from '../../context/ChatContext';
import { AIService } from '../../services/aiService';

interface MessageComposerProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  replyingTo,
  onCancelReply,
}) => {
  const { sendMessage } = useChat();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);

  const timerRef = useRef<any>(null);

  const emojis = ['❤️', '😂', '🔥', '✨', '👍', '🙏', '🎉', '😍', '👏', '🥳', '😎', '💯'];

  const handleInputChange = (val: string) => {
    setText(val);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    sendMessage(
      text.trim(),
      undefined,
      replyingTo
        ? {
            messageId: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
          }
        : undefined
    );
    setText('');
    onCancelReply();
    setSmartReplies([]);
  };

  const handleSendAttachment = (url: string, type: 'image' | 'video' = 'image') => {
    sendMessage(
      '',
      [{ id: `att-${Date.now()}`, type, url }],
      replyingTo
        ? {
            messageId: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
          }
        : undefined
    );
    setShowAttachMenu(false);
    onCancelReply();
  };

  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleFinishVoiceRecord = () => {
    clearInterval(timerRef.current);
    setIsRecordingVoice(false);

    // Send synthetic audio note
    sendMessage(
      '',
      [
        {
          id: `aud-${Date.now()}`,
          type: 'audio',
          url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg',
        },
      ],
      replyingTo
        ? {
            messageId: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
          }
        : undefined
    );
    onCancelReply();
  };

  const handleFetchSmartReplies = async () => {
    if (!replyingTo?.text) return;
    setIsLoadingSmartReplies(true);
    try {
      const suggestions = await AIService.suggestReplies(
        replyingTo.text,
        replyingTo.senderName
      );
      setSmartReplies(suggestions);
    } finally {
      setIsLoadingSmartReplies(false);
    }
  };

  return (
    <div className="relative border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 select-none">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-pink-500/10 dark:bg-pink-500/15 border border-pink-500/20 rounded-2xl text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-pink-600 dark:text-pink-400">
              Replying to {replyingTo.senderName}:
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 truncate">
              {replyingTo.text || '[Attachment]'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFetchSmartReplies}
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              {isLoadingSmartReplies ? 'Thinking...' : 'AI Replies'}
            </button>
            <button onClick={onCancelReply} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Smart Reply suggestion chips */}
      {smartReplies.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
          {smartReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => {
                setText(reply);
                setSmartReplies([]);
              }}
              className="px-3 py-1 bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-500/20 hover:bg-purple-500/20 shrink-0 transition-colors"
            >
              ✨ {reply}
            </button>
          ))}
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {isRecordingVoice ? (
        <div className="flex items-center justify-between px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Recording Voice Note ({recordingSeconds}s)...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearInterval(timerRef.current);
                setIsRecordingVoice(false);
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleFinishVoiceRecord}
              className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-rose-600 shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Send Audio</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard Input Form */
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Attachment button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Add media"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Attach dropdown */}
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 w-48 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-30 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handleSendAttachment(
                      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
                    )
                  }
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                >
                  <Image className="w-4 h-4 text-pink-500" />
                  <span>Send Cat Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendAttachment(
                      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
                    )
                  }
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                >
                  <Image className="w-4 h-4 text-indigo-500" />
                  <span>Send Landscape</span>
                </button>
              </div>
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={text}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type a message..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 border border-zinc-200 dark:border-zinc-700/60"
            />

            {/* Emoji popover trigger */}
            <div className="absolute right-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-10 right-0 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-30 grid grid-cols-4 gap-1">
                  {emojis.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setText((prev) => prev + em);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 text-lg hover:scale-125 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice record or Send Button */}
          {text.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white shadow-md active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartVoiceRecord}
              className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-pink-500 hover:text-white text-zinc-500 dark:text-zinc-400 active:scale-95 transition-all"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
