import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { CommentsDrawer } from '../comments/CommentsDrawer';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { Reel } from '../../types';

interface ReelsFeedProps {
  onSelectUser: (userId: string) => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({ onSelectUser }) => {
  const { reels, toggleLikeReel } = usePosts();
  const { currentUser, toggleFollow, isFollowing } = useAuth();
  const { startDirectChat, sendMessage } = useChat();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCommentsReel, setActiveCommentsReel] = useState<Reel | null>(null);

  const currentReel = reels[currentIndex] || reels[0];

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    if (!currentReel) return;
    navigator.clipboard?.writeText?.(window.location.origin + `?reel=${currentReel.id}`);
    showToast('Reel link copied to clipboard! 📋');
  };

  if (!currentReel) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-zinc-400">
        No reels available.
      </div>
    );
  }

  const isUserFollowed = isFollowing(currentReel.authorId);

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto h-[86vh] max-h-[860px] my-2 md:my-4 rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none">
      {/* Video Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentReel.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full"
        >
          <video
            src={currentReel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Sound Toggle Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Bottom Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2.5 text-white z-10">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => onSelectUser(currentReel.authorId)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Avatar src={currentReel.author.avatar} size="sm" />
                <span className="font-bold text-sm text-white group-hover:text-pink-400 transition-colors">
                  {currentReel.author.username}
                </span>
                {currentReel.author.isVerified && <VerifiedBadge size="sm" />}
              </div>

              {currentUser?.id !== currentReel.authorId && (
                <button
                  onClick={() => toggleFollow(currentReel.authorId)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isUserFollowed
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {isUserFollowed ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Caption */}
            <p className="text-xs text-zinc-100 leading-relaxed max-w-[80%] line-clamp-2">
              {currentReel.caption}
            </p>

            {/* Soundtrack Info Bar */}
            {currentReel.music && (
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Music className="w-3.5 h-3.5 animate-bounce" />
                <span className="truncate">
                  {currentReel.music.title} • {currentReel.music.artist}
                </span>
              </div>
            )}
          </div>

          {/* Floating Right Action Sidebar */}
          <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 z-20">
            {/* Avatar with Follow Plus badge */}
            <div className="relative">
              <Avatar
                src={currentReel.author.avatar}
                size="md"
                onClick={() => onSelectUser(currentReel.authorId)}
              />
              {!isUserFollowed && currentUser?.id !== currentReel.authorId && (
                <button
                  onClick={() => toggleFollow(currentReel.authorId)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 p-0.5 bg-pink-500 text-white rounded-full"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={() => toggleLikeReel(currentReel.id)}
              className="flex flex-col items-center gap-1 text-white group"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
                <Heart
                  className={`w-6 h-6 transition-transform group-active:scale-125 ${
                    currentReel.isLiked ? 'fill-pink-500 text-pink-500' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold">
                {currentReel.likesCount.toLocaleString()}
              </span>
            </button>

            {/* Comments button */}
            <button
              onClick={() => setActiveCommentsReel(currentReel)}
              className="flex flex-col items-center gap-1 text-white group"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
                <MessageCircle className="w-6 h-6 transition-transform group-active:scale-125" />
              </div>
              <span className="text-[11px] font-bold">
                {currentReel.commentsCount.toLocaleString()}
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 text-white group"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
                <Send className="w-6 h-6 transition-transform group-active:scale-125" />
              </div>
              <span className="text-[11px] font-bold">Share</span>
            </button>

            {/* Spinning Vinyl Record for Music */}
            <div className="w-10 h-10 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center animate-spin">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Up / Down Navigation Controls for Desktop */}
      <div className="hidden lg:flex flex-col gap-2 absolute -right-16 top-1/2 -translate-y-1/2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-white shadow-lg disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-white shadow-lg disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Comment Drawer for Reel */}
      {activeCommentsReel && (
        <CommentsDrawer
          post={{
            id: activeCommentsReel.id,
            authorId: activeCommentsReel.authorId,
            author: activeCommentsReel.author,
            media: [{ id: 'rm-1', type: 'video', url: activeCommentsReel.videoUrl }],
            caption: activeCommentsReel.caption,
            hashtags: activeCommentsReel.hashtags,
            likesCount: activeCommentsReel.likesCount,
            commentsCount: activeCommentsReel.commentsCount,
            sharesCount: activeCommentsReel.sharesCount,
            allowComments: true,
            allowSharing: true,
            audience: 'public',
            createdAt: activeCommentsReel.createdAt,
          }}
          isOpen={!!activeCommentsReel}
          onClose={() => setActiveCommentsReel(null)}
          onSelectUser={(userId) => {
            setActiveCommentsReel(null);
            onSelectUser(userId);
          }}
        />
      )}
    </div>
  );
};
