import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Music,
  MapPin,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';

interface PostCardProps {
  post: Post;
  onOpenComments: (post: Post) => void;
  onOpenOptions: (post: Post) => void;
  onSelectUser: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onOpenOptions,
  onSelectUser,
}) => {
  const { toggleLikePost, toggleSavePost } = usePosts();
  const { currentUser } = useAuth();
  const { startDirectChat, sendMessage } = useChat();
  const { showToast } = useToast();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);

  const { addComment } = usePosts();

  const currentMedia = post.media[activeMediaIndex] || post.media[0];

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLikePost(post.id);
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMediaIndex < post.media.length - 1) {
      setActiveMediaIndex((prev) => prev + 1);
    }
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMediaIndex > 0) {
      setActiveMediaIndex((prev) => prev - 1);
    }
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleShareToDM = (targetUserId: string) => {
    const targetUser = {
      id: targetUserId,
      username: 'friend',
      displayName: 'Friend',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      email: '',
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: '',
    };
    startDirectChat(targetUser);
    sendMessage(`Check out this post by @${post.author.username}: "${post.caption.slice(0, 50)}..."`);
    setShowSharePopup(false);
    showToast('Shared post to chat! 🚀');
  };

  // Format caption for hashtags and mentions
  const renderFormattedCaption = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="font-semibold text-pink-500 hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={i} className="font-semibold text-indigo-500 hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div
          onClick={() => onSelectUser(post.authorId)}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <Avatar
            src={post.author.avatar}
            alt={post.author.displayName}
            size="md"
            hasStory={true}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors">
                {post.author.displayName}
              </span>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>@{post.author.username}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenOptions(post)}
          className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media Carousel / Video Stage */}
      <div
        onDoubleClick={handleDoubleTap}
        className="relative w-full aspect-[4/5] bg-zinc-950 overflow-hidden cursor-pointer select-none"
      >
        {currentMedia && (
          <img
            src={currentMedia.url}
            alt="Post content"
            className="w-full h-full object-cover transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Carousel Navigation Arrows */}
        {post.media.length > 1 && (
          <>
            {activeMediaIndex > 0 && (
              <button
                onClick={handlePrevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {activeMediaIndex < post.media.length - 1 && (
              <button
                onClick={handleNextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
              {post.media.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeMediaIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Double-tap Floating Heart Animation */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 1], rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-28 h-28 text-pink-500 fill-pink-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={() => toggleLikePost(post.id)}
              className="group p-1 -m-1 text-zinc-700 dark:text-zinc-200 hover:text-pink-500 transition-colors"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-125 ${
                  post.isLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
            </button>

            {/* Comment Drawer Trigger */}
            <button
              onClick={() => onOpenComments(post)}
              className="group p-1 -m-1 text-zinc-700 dark:text-zinc-200 hover:text-indigo-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6 transition-transform group-active:scale-125" />
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShowSharePopup(!showSharePopup)}
                className="group p-1 -m-1 text-zinc-700 dark:text-zinc-200 hover:text-purple-500 transition-colors"
              >
                <Send className="w-6 h-6 transition-transform group-active:scale-125" />
              </button>

              {/* Share Popover */}
              {showSharePopup && (
                <div className="absolute bottom-10 left-0 w-56 p-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 z-30 flex flex-col gap-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Share to message
                  </div>
                  <button
                    onClick={() => handleShareToDM('user-elena')}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                      size="xs"
                    />
                    <span>Elena Rostova</span>
                  </button>
                  <button
                    onClick={() => handleShareToDM('user-marcus')}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                      size="xs"
                    />
                    <span>Marcus Chen</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText?.(window.location.origin + `?post=${post.id}`);
                      showToast('Post URL copied to clipboard! 📋');
                      setShowSharePopup(false);
                    }}
                    className="p-2 rounded-xl text-xs font-bold text-center bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookmark / Save */}
          <button
            onClick={() => toggleSavePost(post.id)}
            className="p-1 -m-1 text-zinc-700 dark:text-zinc-200 hover:text-amber-500 transition-colors"
          >
            <Bookmark
              className={`w-6 h-6 transition-transform active:scale-125 ${
                post.isSaved ? 'fill-amber-500 text-amber-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
          {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
        </div>

        {/* Audio Track Info Badge */}
        {post.music && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/15 py-1 px-2.5 rounded-full w-fit">
            <Music className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {post.music.title} • {post.music.artist}
            </span>
          </div>
        )}

        {/* Caption */}
        <div className="mt-2 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <span
            onClick={() => onSelectUser(post.authorId)}
            className="font-bold mr-2 text-zinc-900 dark:text-white cursor-pointer hover:underline"
          >
            {post.author.username}
          </span>
          <span>
            {isCaptionExpanded
              ? renderFormattedCaption(post.caption)
              : renderFormattedCaption(
                  post.caption.length > 110
                    ? post.caption.slice(0, 110) + '...'
                    : post.caption
                )}
          </span>
          {post.caption.length > 110 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="ml-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {isCaptionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => onOpenComments(post)}
            className="mt-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors block"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Quick In-line Comment Form */}
      {post.allowComments && (
        <form
          onSubmit={handleQuickCommentSubmit}
          className="flex items-center gap-3 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/80"
        >
          <Avatar src={currentUser?.avatar} size="xs" />
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {commentInput.trim() && (
            <button
              type="submit"
              className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors"
            >
              Post
            </button>
          )}
        </form>
      )}
    </article>
  );
};
