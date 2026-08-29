import React, { useState } from 'react';
import {
  Grid,
  Bookmark,
  Heart,
  Film,
  Settings,
  Link as LinkIcon,
  Calendar,
  Lock,
  MessageCircle,
  Plus,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EditProfileModal } from './EditProfileModal';
import { PostCard } from '../feed/PostCard';
import { CommentsDrawer } from '../comments/CommentsDrawer';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { User, Post } from '../../types';

interface ProfileViewProps {
  userId?: string;
  onSelectUser: (userId: string) => void;
  onOpenSettings: () => void;
  onOpenCreatePost: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onSelectUser,
  onOpenSettings,
  onOpenCreatePost,
}) => {
  const { currentUser, allUsers, toggleFollow, isFollowing } = useAuth();
  const { posts, stories } = usePosts();
  const { startDirectChat } = useChat();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'liked'>('posts');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeListModal, setActiveListModal] = useState<'followers' | 'following' | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);

  // Target user
  const targetUser: User =
    (userId ? allUsers.find((u) => u.id === userId) : currentUser) || currentUser!;

  const isOwnProfile = currentUser?.id === targetUser?.id;
  const isTargetFollowed = !isOwnProfile && isFollowing(targetUser.id);

  // Filter posts
  const userPosts = posts.filter((p) => p.authorId === targetUser.id);
  const userSavedPosts = posts.filter((p) => p.isSaved);
  const userLikedPosts = posts.filter((p) => p.isLiked);


  const displayPosts =
    activeTab === 'saved'
      ? userSavedPosts
      : activeTab === 'liked'
      ? userLikedPosts
      : userPosts;

  const handleMessage = () => {
    startDirectChat(targetUser);
    // Navigation to messages happens via parent
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.origin + `?user=${targetUser.username}`);
    showToast('Profile link copied! 📋');
  };

  const highlights = [
    { title: 'Travel ✈️', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
    { title: 'Design 🎨', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80' },
    { title: 'Tokyo 🌸', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80' },
    { title: 'Vibes ✨', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          {/* Avatar */}
          <div className="relative group cursor-pointer">
            <Avatar
              src={targetUser.avatar}
              alt={targetUser.displayName}
              size="2xl"
              hasStory={stories.some((s) => s.userId === targetUser.id)}
            />
          </div>

          {/* User Details */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            {/* Top row: username & actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="font-display font-black text-xl md:text-2xl text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>{targetUser.username}</span>
                {targetUser.isVerified && <VerifiedBadge size="md" />}
              </h1>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </Button>
                    <button
                      onClick={onOpenSettings}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant={isTargetFollowed ? 'outline' : 'gradient'}
                      onClick={() => toggleFollow(targetUser.id)}
                    >
                      {isTargetFollowed ? 'Following' : 'Follow'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleMessage}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      Message
                    </Button>
                    <button
                      onClick={handleShareProfile}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Counts Row */}
            <div className="flex items-center gap-6 md:gap-8 text-sm">
              <div className="flex flex-col md:flex-row items-center gap-1">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {userPosts.length}
                </span>
                <span className="text-zinc-500 text-xs">posts</span>
              </div>

              <div
                onClick={() => setActiveListModal('followers')}
                className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-pink-500 transition-colors"
              >
                <span className="font-bold text-zinc-900 dark:text-white">
                  {targetUser.followersCount.toLocaleString()}
                </span>
                <span className="text-zinc-500 text-xs">followers</span>
              </div>

              <div
                onClick={() => setActiveListModal('following')}
                className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-pink-500 transition-colors"
              >
                <span className="font-bold text-zinc-900 dark:text-white">
                  {targetUser.followingCount.toLocaleString()}
                </span>
                <span className="text-zinc-500 text-xs">following</span>
              </div>
            </div>

            {/* Name, Bio, Links */}
            <div className="flex flex-col items-center md:items-start gap-1 text-sm text-center md:text-left">
              <span className="font-bold text-zinc-900 dark:text-white">
                {targetUser.displayName}
              </span>
              {targetUser.bio && (
                <p className="text-zinc-700 dark:text-zinc-300 max-w-lg leading-relaxed whitespace-pre-wrap">
                  {targetUser.bio}
                </p>
              )}

              {targetUser.website && (
                <a
                  href={targetUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:underline mt-1"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{targetUser.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {new Date(targetUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
          {highlights.map((hl, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-pink-500 transition-colors overflow-hidden">
                <img src={hl.image} alt={hl.title} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-pink-500 transition-colors">
                {hl.title}
              </span>
            </div>
          ))}
          {isOwnProfile && (
            <div
              onClick={onOpenCreatePost}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 group-hover:border-pink-500 flex items-center justify-center text-zinc-400 group-hover:text-pink-500 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-zinc-400">New</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-center gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-pink-500 text-pink-500'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'reels'
              ? 'border-pink-500 text-pink-500'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels</span>
        </button>

        {isOwnProfile && (
          <>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'saved'
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </button>

            <button
              onClick={() => setActiveTab('liked')}
              className={`flex items-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'liked'
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Liked</span>
            </button>
          </>
        )}
      </div>

      {/* Grid Posts Gallery */}
      {displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
          <Grid className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white mb-1">
            No posts yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mb-4">
            {isOwnProfile
              ? 'Share your first photo or video to bring your profile to life!'
              : 'This user has not posted anything yet.'}
          </p>
          {isOwnProfile && (
            <Button size="sm" variant="gradient" onClick={onOpenCreatePost}>
              Create Post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPostDetail(post)}
              className="group relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-950 cursor-pointer"
            >
              <img
                src={post.media[0]?.url}
                alt="Post thumbnail"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Hover Overlay with Counts */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white text-sm font-bold">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>

              {/* Multi-image indicator */}
              {post.media.length > 1 && (
                <div className="absolute top-2.5 right-2.5 p-1 bg-black/60 rounded-lg text-white">
                  <Grid className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Followers / Following List Modal */}
      <Modal
        isOpen={!!activeListModal}
        onClose={() => setActiveListModal(null)}
        title={activeListModal === 'followers' ? 'Followers' : 'Following'}
        maxWidth="sm"
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {allUsers
            .filter((u) => u.id !== targetUser.id)
            .map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div
                  onClick={() => {
                    setActiveListModal(null);
                    onSelectUser(u.id);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <Avatar src={u.avatar} size="sm" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-bold text-xs text-zinc-900 dark:text-white">
                      <span>{u.displayName}</span>
                      {u.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-[11px] text-zinc-400">@{u.username}</span>
                  </div>
                </div>

                {currentUser?.id !== u.id && (
                  <Button
                    size="xs"
                    variant={isFollowing(u.id) ? 'outline' : 'gradient'}
                    onClick={() => toggleFollow(u.id)}
                  >
                    {isFollowing(u.id) ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            ))}
        </div>
      </Modal>

      {/* Post Detail Drawer / Modal */}
      {selectedPostDetail && (
        <CommentsDrawer
          post={selectedPostDetail}
          isOpen={!!selectedPostDetail}
          onClose={() => setSelectedPostDetail(null)}
          onSelectUser={(uid) => {
            setSelectedPostDetail(null);
            onSelectUser(uid);
          }}
        />
      )}
    </div>
  );
};
