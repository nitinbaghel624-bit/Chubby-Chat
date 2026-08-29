import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CheckCheck,
  Smile,
  Trash2,
  Languages,
  Play,
  Pause,
  CornerUpLeft,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { AIService } from '../../services/aiService';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReply,
}) => {
  const { currentUser } = useAuth();
  const { addReaction, deleteMessage } = useChat();

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const quickEmojis = ['❤️', '🔥', '😂', '👍', '😮', '👏'];

  const handleReaction = (emoji: string) => {
    addReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await AIService.translateMessage(message.text, 'English');
      setTranslatedText(translated);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      className={`group relative flex items-end gap-2.5 my-2 max-w-[85%] md:max-w-[70%] select-none ${
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Avatar for non-own messages */}
      {!isOwn && (
        <Avatar src={message.senderAvatar} alt={message.senderName} size="xs" />
      )}

      <div className="flex flex-col gap-1 relative">
        {/* Reply Quote Snippet */}
        {message.replyTo && (
          <div
            className={`text-xs px-3 py-1.5 rounded-xl border opacity-80 mb-0.5 line-clamp-1 ${
              isOwn
                ? 'bg-pink-600/30 text-white border-pink-400/30'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <span className="font-bold mr-1">Replying to {message.replyTo.senderName}:</span>
            <span>{message.replyTo.text}</span>
          </div>
        )}

        {/* Message Bubble Box */}
        <div
          className={`relative px-4 py-2.5 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${
            isOwn
              ? 'bg-gradient-to-tr from-pink-600 to-purple-600 text-white rounded-br-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm border border-zinc-200/80 dark:border-zinc-700/60'
          }`}
        >
          {/* Sender Name for group chats */}
          {!isOwn && (
            <div className="text-[11px] font-bold text-pink-500 dark:text-pink-400 mb-0.5">
              {message.senderName}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-col gap-2 my-1">
              {message.attachments.map((att) => {
                if (att.type === 'image') {
                  return (
                    <div key={att.id} className="rounded-2xl overflow-hidden max-w-xs max-h-64 bg-black/20">
                      <img
                        src={att.url}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                }
                if (att.type === 'audio') {
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/20 dark:bg-black/40 min-w-[200px]"
                    >
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="p-2 rounded-full bg-white text-pink-600 shadow-md hover:scale-105 active:scale-95 transition-transform"
                      >
                        {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1 h-4">
                          {[3, 8, 5, 12, 6, 14, 9, 4, 11, 7, 13, 8, 4, 10, 6, 12, 5].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h * 1.2}px` }}
                              className={`w-1 rounded-full transition-all ${
                                isPlayingAudio ? 'bg-pink-400 animate-pulse' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] opacity-75">Voice Note (0:14)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Main Text Content */}
          {message.text && <p className="break-words whitespace-pre-wrap">{message.text}</p>}

          {/* Translation Result */}
          {translatedText && (
            <div className="mt-2 pt-2 border-t border-white/20 text-xs italic opacity-95">
              <span className="font-semibold not-italic text-[10px] uppercase tracking-wider block opacity-70">
                Translated:
              </span>
              {translatedText}
            </div>
          )}

          {/* Timestamp & Status Indicator */}
          <div
            className={`flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70 ${
              isOwn ? 'text-pink-100' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isOwn && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-200 stroke-[2.5]" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-white/60" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges Container */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`flex items-center gap-1 -mt-2.5 z-10 ${
              isOwn ? 'justify-end pr-2' : 'justify-start pl-2'
            }`}
          >
            {message.reactions.map((r, i) => (
              <span
                key={i}
                title={`Reacted by @${r.username}`}
                onClick={() => addReaction(message.id, r.emoji)}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm text-xs font-semibold cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              >
                <span>{r.emoji}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover (Reply, Emoji, Translate, Delete) */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-1 shadow-md z-20 ${
          isOwn ? 'order-first' : 'order-last'
        }`}
      >
        {/* Reply */}
        <button
          onClick={() => onReply(message)}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Reply"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>

        {/* Emoji Reaction Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1 rounded-lg text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="React"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {/* Quick Reaction Picker flyout */}
          {showReactionPicker && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-2xl z-30">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-base hover:scale-130 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Translate with Gemini AI */}
        {message.text && (
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="p-1 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Translate"
          >
            <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Delete if Own */}
        {isOwn && (
          <button
            onClick={() => deleteMessage(message.id)}
            className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
