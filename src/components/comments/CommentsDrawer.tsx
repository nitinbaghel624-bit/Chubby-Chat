import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send, CornerDownRight, Trash2 } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';

interface CommentsDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  post,
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const { getComments, addComment, deleteComment, toggleLikeComment } = usePosts();
  const { currentUser } = useAuth();

  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  if (!isOpen || !post) return null;

  const comments = getComments(post.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addComment(post.id, text.trim(), replyingTo?.id, replyingTo?.username);
    setText('');
    setReplyingTo(null);
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    setText(`@${username} `);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Drawer container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col z-10 border-l border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              Comments ({comments.length})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {/* Original Post Caption Header */}
            <div className="flex items-start gap-3 pb-3">
              <Avatar
                src={post.author.avatar}
                alt={post.author.displayName}
                size="sm"
                onClick={() => onSelectUser(post.authorId)}
              />
              <div className="flex flex-col text-xs text-zinc-800 dark:text-zinc-200">
                <div className="flex items-center gap-1">
                  <span
                    onClick={() => onSelectUser(post.authorId)}
                    className="font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline"
                  >
                    {post.author.username}
                  </span>
                  {post.author.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="mt-1 text-sm leading-relaxed">{post.caption}</p>
                <span className="mt-1 text-[10px] text-zinc-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Comment Items */}
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <p className="text-sm font-medium">No comments yet.</p>
                <p className="text-xs mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((c) => {
                const isOwn = currentUser?.id === c.authorId;
                return (
                  <div key={c.id} className="flex items-start justify-between gap-3 pt-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar
                        src={c.author.avatar}
                        alt={c.author.displayName}
                        size="sm"
                        onClick={() => onSelectUser(c.authorId)}
                      />
                      <div className="flex flex-col text-xs text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onSelectUser(c.authorId)}
                            className="font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline"
                          >
                            {c.author.username}
                          </span>
                          {c.author.isVerified && <VerifiedBadge size="sm" />}
                          <span className="text-[10px] text-zinc-400">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-relaxed">
                          {c.replyToUsername && (
                            <span className="text-pink-500 font-semibold mr-1">
                              @{c.replyToUsername}
                            </span>
                          )}
                          {c.text}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-zinc-400">
                          <button
                            onClick={() => handleReply(c.id, c.author.username)}
                            className="hover:text-pink-500 transition-colors flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Reply
                          </button>
                          {isOwn && (
                            <button
                              onClick={() => deleteComment(post.id, c.id)}
                              className="text-rose-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Like comment */}
                    <button
                      onClick={() => toggleLikeComment(post.id, c.id)}
                      className="flex flex-col items-center gap-0.5 p-1 text-zinc-400 hover:text-pink-500 transition-colors"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          c.isLiked ? 'fill-pink-500 text-pink-500' : ''
                        }`}
                      />
                      {c.likesCount > 0 && (
                        <span className="text-[10px] font-bold">{c.likesCount}</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick emoji reaction bar */}
          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
            {['❤️', '🙌', '🔥', '👏', '😍', '😂', '✨'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((prev) => prev + emoji)}
                className="text-lg hover:scale-125 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply indicator banner */}
          {replyingTo && (
            <div className="px-4 py-1.5 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold flex items-center justify-between">
              <span>Replying to @{replyingTo.username}</span>
              <button onClick={() => setReplyingTo(null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900"
          >
            <Avatar src={currentUser?.avatar} size="xs" />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                replyingTo ? `Reply to @${replyingTo.username}...` : 'Write a comment...'
              }
              className="flex-1 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2.5 rounded-full bg-pink-500 hover:bg-pink-400 disabled:opacity-40 text-white transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
