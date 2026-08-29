import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Send, Heart, Flame, Sparkles } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { UserStories, StoryItem } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { sounds } from '../../utils/audio';

interface StoryViewerModalProps {
  userStory: UserStories | null;
  onClose: () => void;
  onSelectUserStory: (story: UserStories) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  userStory,
  onClose,
}) => {
  const { stories, voteStoryPoll, respondStoryQuestion } = usePosts();
  const { currentUser } = useAuth();
  const { startDirectChat, sendMessage } = useChat();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  const timerRef = useRef<any>(null);
  const currentStoryItem: StoryItem | undefined = userStory?.items[currentIndex];

  // Reset index when changing user story
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [userStory?.userId]);

  // Story progression timer
  useEffect(() => {
    if (!userStory || isPaused) return;

    const interval = 50;
    const step = (interval / STORY_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userStory, currentIndex, isPaused]);

  if (!userStory || !currentStoryItem) return null;

  const handleNext = () => {
    if (currentIndex < userStory.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Look for next user's story
      const currentIndexInAll = stories.findIndex((s) => s.userId === userStory.userId);
      if (currentIndexInAll >= 0 && currentIndexInAll < stories.length - 1) {
        // Next user story
        // Close or advance
        onClose();
      } else {
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    // Send direct message
    const targetUser = {
      id: userStory.user.id,
      username: userStory.user.username,
      displayName: userStory.user.displayName,
      avatar: userStory.user.avatar,
      email: '',
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: '',
    };

    startDirectChat(targetUser);
    sendMessage(`Replied to your story: "${replyText.trim()}"`);
    setReplyText('');
    sounds.playMessageSent();
  };

  const handleEmojiReaction = (emoji: string) => {
    if (!currentUser) return;
    const targetUser = {
      id: userStory.user.id,
      username: userStory.user.username,
      displayName: userStory.user.displayName,
      avatar: userStory.user.avatar,
      email: '',
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: '',
    };
    startDirectChat(targetUser);
    sendMessage(`Reacted ${emoji} to your story`);
    sounds.playLikePop();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button for Desktop */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 transition-all z-40"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Story Player Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md h-[88vh] max-h-[820px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Progress Indicators */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
            {userStory.items.map((item, idx) => (
              <div
                key={item.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx === currentIndex
                        ? `${progress}%`
                        : idx < currentIndex
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header Info */}
          <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Avatar src={userStory.user.avatar} size="sm" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <span>{userStory.user.displayName}</span>
                  {userStory.user.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <span className="text-[11px] text-white/70">
                  {new Date(currentStoryItem.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Media Content */}
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
            <img
              src={currentStoryItem.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Click zones for navigation */}
            <div
              onClick={handlePrev}
              className="absolute left-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
            />
            <div
              onClick={handleNext}
              className="absolute right-0 top-16 bottom-24 w-2/3 z-20 cursor-pointer"
            />

            {/* Interactive Overlay Widgets */}
            <div className="absolute inset-x-4 bottom-24 z-30 flex flex-col gap-3 pointer-events-auto">
              {/* Caption */}
              {currentStoryItem.caption && (
                <div className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white text-sm font-medium border border-white/10 text-center">
                  {currentStoryItem.caption}
                </div>
              )}

              {/* Poll Widget */}
              {currentStoryItem.poll && (
                <div className="p-4 bg-black/75 backdrop-blur-md rounded-2xl border border-white/15 text-white flex flex-col gap-3 shadow-xl">
                  <div className="font-bold text-center text-sm font-display">
                    {currentStoryItem.poll.question}
                  </div>
                  <div className="flex flex-col gap-2">
                    {currentStoryItem.poll.options.map((opt, optIdx) => {
                      const totalVotes = currentStoryItem.poll?.options.reduce((a, b) => a + b.votes, 0) || 1;
                      const percentage = Math.round((opt.votes / totalVotes) * 100);
                      const hasVoted = currentStoryItem.poll?.userVotedIndex !== undefined;
                      const isUserChoice = currentStoryItem.poll?.userVotedIndex === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => voteStoryPoll(currentStoryItem.id, optIdx)}
                          className={`relative overflow-hidden w-full p-2.5 rounded-xl text-sm font-bold text-left border transition-all cursor-pointer ${
                            isUserChoice
                              ? 'border-pink-500 bg-pink-500/20'
                              : 'border-white/20 hover:border-white/40 bg-white/10'
                          }`}
                        >
                          {/* Percentage Progress Bar */}
                          {hasVoted && (
                            <div
                              className="absolute inset-y-0 left-0 bg-pink-500/30 rounded-xl"
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                          <div className="relative z-10 flex items-center justify-between">
                            <span>{opt.text}</span>
                            {hasVoted && <span className="text-xs font-bold text-pink-300">{percentage}%</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Question Widget */}
              {currentStoryItem.questionPrompt && (
                <div className="p-4 bg-gradient-to-tr from-purple-900/80 to-indigo-900/80 backdrop-blur-md rounded-2xl border border-purple-500/30 text-white flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-bold text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Me Anything</span>
                  </div>
                  <div className="font-bold text-sm text-center">
                    {currentStoryItem.questionPrompt.prompt}
                  </div>

                  {!showQuestionInput ? (
                    <button
                      onClick={() => setShowQuestionInput(true)}
                      className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold text-center transition-colors"
                    >
                      Tap to answer...
                    </button>
                  ) : (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={questionAnswer}
                        onChange={(e) => setQuestionAnswer(e.target.value)}
                        placeholder="Type response..."
                        className="flex-1 bg-black/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-pink-400"
                      />
                      <button
                        onClick={() => {
                          if (questionAnswer.trim()) {
                            respondStoryQuestion(currentStoryItem.id, questionAnswer.trim());
                            setQuestionAnswer('');
                            setShowQuestionInput(false);
                          }
                        }}
                        className="p-2 bg-pink-500 rounded-xl text-white font-bold text-xs"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Interactive Reply Bar */}
          <div className="relative z-30 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2">
            {/* Quick emoji reaction bar */}
            <div className="flex items-center justify-center gap-4 py-1">
              {['❤️', '🔥', '😂', '👏', '😍', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReaction(emoji)}
                  className="text-xl hover:scale-125 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${userStory.user.displayName}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/60 text-sm border border-white/20 focus:outline-none focus:border-pink-400"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-pink-500 text-white hover:bg-pink-400 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Next Button for Desktop */}
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-40"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </AnimatePresence>
  );
};
