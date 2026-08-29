import React from 'react';
import { Modal } from '../common/Modal';
import { Flag, Trash2, Link2, UserMinus, VolumeX } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { useToast } from '../../context/ToastContext';

interface PostOptionsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: (post: Post) => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenReport,
}) => {
  const { currentUser, toggleFollow, toggleMute } = useAuth();
  const { deletePost } = usePosts();
  const { showToast } = useToast();

  if (!post) return null;

  const isOwnPost = currentUser?.id === post.authorId;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + `?post=${post.id}`);
    showToast('Post link copied to clipboard! 📋');
    onClose();
  };

  const handleDelete = () => {
    deletePost(post.id);
    onClose();
  };

  const handleUnfollow = () => {
    toggleFollow(post.authorId);
    onClose();
  };

  const handleMute = () => {
    toggleMute(post.authorId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 -mx-6 -my-6 text-center text-sm font-semibold">
        {isOwnPost ? (
          <button
            onClick={handleDelete}
            className="w-full py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Post</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                onClose();
                onOpenReport(post);
              }}
              className="w-full py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Flag className="w-4 h-4" />
              <span>Report Post</span>
            </button>

            <button
              onClick={handleUnfollow}
              className="w-full py-4 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserMinus className="w-4 h-4 text-zinc-400" />
              <span>Unfollow @{post.author.username}</span>
            </button>

            <button
              onClick={handleMute}
              className="w-full py-4 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <VolumeX className="w-4 h-4 text-zinc-400" />
              <span>Mute @{post.author.username}</span>
            </button>
          </>
        )}

        <button
          onClick={handleCopyLink}
          className="w-full py-4 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Link2 className="w-4 h-4 text-zinc-400" />
          <span>Copy Link</span>
        </button>

        <button
          onClick={onClose}
          className="w-full py-4 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
