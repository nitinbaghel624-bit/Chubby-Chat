import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  Grid,
  Film,
  Users,
  Hash,
  Heart,
  MessageCircle,
  MapPin,
  Radio,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { CommentsDrawer } from '../comments/CommentsDrawer';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { TRENDING_HASHTAGS } from '../../data/mockData';
import { Post } from '../../types';

interface ExploreViewProps {
  onSelectUser: (userId: string) => void;
  onOpenNearby?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSelectUser, onOpenNearby }) => {
  const { posts } = usePosts();
  const { allUsers, currentUser, toggleFollow, isFollowing } = useAuth();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const categories = [
    'All',
    'For You',
    'Design',
    'Photography',
    'Tokyo',
    'Art & 3D',
    'Fashion',
    'Music',
    'Food',
  ];

  // Search results for users
  const matchedUsers = query.trim()
    ? allUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.displayName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (query.trim()) {
      const matchCaption = p.caption.toLowerCase().includes(query.toLowerCase());
      const matchTag = p.hashtags?.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchAuthor = p.author.username.toLowerCase().includes(query.toLowerCase());
      return matchCaption || matchTag || matchAuthor;
    }
    if (activeCategory !== 'All' && activeCategory !== 'For You') {
      return (
        p.caption.toLowerCase().includes(activeCategory.toLowerCase()) ||
        p.hashtags?.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-6">
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, tags, inspiration..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* User Search Results Dropdown */}
      {matchedUsers.length > 0 && (
        <div className="max-w-2xl mx-auto mb-6 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 pt-1">
            Accounts
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {matchedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div
                  onClick={() => onSelectUser(user.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Avatar src={user.avatar} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 font-bold text-xs text-zinc-900 dark:text-white truncate">
                      <span>{user.displayName}</span>
                      {user.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-[11px] text-zinc-400 truncate">@{user.username}</span>
                  </div>
                </div>

                {currentUser?.id !== user.id && (
                  <Button
                    size="xs"
                    variant={isFollowing(user.id) ? 'outline' : 'gradient'}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {isFollowing(user.id) ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People Nearby Discovery Card Banner */}
      {onOpenNearby && !query && (
        <div
          onClick={onOpenNearby}
          className="max-w-6xl mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  People Nearby
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white">
                  New
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Discover active creators and friends around your neighborhood
              </p>
            </div>
          </div>

          <Button size="xs" variant="primary">
            Explore Nearby
          </Button>
        </div>
      )}

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-pink-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Explore Grid - Responsive Bento & Masonry Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredPosts.map((post, idx) => {
          const isLarge = idx % 7 === 0;
          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`group relative rounded-3xl overflow-hidden bg-zinc-950 cursor-pointer shadow-sm ${
                isLarge ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
              }`}
            >
              <img
                src={post.media[0]?.url}
                alt="Explore"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                <div className="flex items-center gap-2">
                  <Avatar src={post.author.avatar} size="xs" />
                  <span className="font-bold text-xs drop-shadow truncate">
                    {post.author.username}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm font-bold">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.commentsCount}</span>
                  </div>
                </div>

                <p className="text-xs line-clamp-1 opacity-90">{post.caption}</p>
              </div>

              {/* Multi-image / Video indicator */}
              {post.media.length > 1 && (
                <div className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-xl text-white">
                  <Grid className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comments / Post Detail Drawer */}
      {selectedPost && (
        <CommentsDrawer
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onSelectUser={(uid) => {
            setSelectedPost(null);
            onSelectUser(uid);
          }}
        />
      )}
    </div>
  );
};
