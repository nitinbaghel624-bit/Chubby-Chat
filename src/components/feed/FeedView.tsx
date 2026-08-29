import React, { useState } from 'react';
import { StoriesBar } from './StoriesBar';
import { PostCard } from './PostCard';
import { PostOptionsModal } from './PostOptionsModal';
import { CommentsDrawer } from '../comments/CommentsDrawer';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Post, UserStories } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { TRENDING_HASHTAGS } from '../../data/mockData';
import { Sparkles, TrendingUp, UserPlus } from 'lucide-react';

interface FeedViewProps {
  onSelectUser: (userId: string) => void;
  onOpenCreatePost: () => void;
  onOpenAIAssistant: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  onSelectUser,
  onOpenCreatePost,
  onOpenAIAssistant,
}) => {
  const { posts, stories } = usePosts();
  const { currentUser, allUsers, toggleFollow, isFollowing } = useAuth();

  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeOptionsPost, setActiveOptionsPost] = useState<Post | null>(null);
  const [activeStoryUser, setActiveStoryUser] = useState<UserStories | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  // Suggested users to follow
  const suggestedUsers = allUsers
    .filter((u) => u.id !== currentUser?.id && !isFollowing(u.id))
    .slice(0, 4);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Feed Column */}
        <div className="lg:col-span-8 max-w-xl mx-auto w-full">
          {/* Stories Bar */}
          <StoriesBar
            onOpenCreateStory={() => setIsCreateStoryOpen(true)}
            onSelectUserStory={(story) => setActiveStoryUser(story)}
          />

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-1">
                Your feed is quiet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
                Be the first to share an inspiring post or follow creators to see their moments here!
              </p>
              <Button variant="gradient" onClick={onOpenCreatePost}>
                Create Your First Post
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onOpenOptions={(p) => setActiveOptionsPost(p)}
                onSelectUser={onSelectUser}
              />
            ))
          )}
        </div>

        {/* Right Sidebar Suggestions & Trends for Large Screens */}
        <div className="hidden lg:flex flex-col gap-6 lg:col-span-4 sticky top-6 h-fit">
          {/* Current User Quick Info */}
          {currentUser && (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
              <div
                onClick={() => onSelectUser(currentUser.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  size="md"
                  status={currentUser.status}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 font-bold text-sm text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors truncate">
                    <span>{currentUser.displayName}</span>
                    {currentUser.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-xs text-zinc-400 truncate">@{currentUser.username}</span>
                </div>
              </div>
              <Button size="xs" variant="ghost" onClick={() => onSelectUser(currentUser.id)}>
                View
              </Button>
            </div>
          )}

          {/* AI Inspiration Banner */}
          <div className="p-4 bg-gradient-to-tr from-purple-900/40 via-pink-900/30 to-indigo-900/40 border border-purple-500/20 rounded-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>AI Content Assistant</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Generate catchy captions, discover trending hashtags, or translate your posts with Gemini.
            </p>
            <Button
              size="sm"
              variant="gradient"
              onClick={onOpenAIAssistant}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Try AI Studio
            </Button>
          </div>

          {/* Suggested Creators */}
          {suggestedUsers.length > 0 && (
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Suggested For You
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3">
                    <div
                      onClick={() => onSelectUser(user.id)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                    >
                      <Avatar src={user.avatar} alt={user.displayName} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1 font-bold text-xs text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors truncate">
                          <span>{user.displayName}</span>
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate">
                          {user.followersCount.toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => toggleFollow(user.id)}
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Hashtags */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
              Trending on Chubby Chat
            </span>
            <div className="flex flex-col gap-2.5">
              {TRENDING_HASHTAGS.slice(0, 5).map((trend, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-pink-500 transition-colors cursor-pointer">
                      #{trend.tag}
                    </span>
                    <span className="text-[10px] text-zinc-400">{trend.category}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {trend.postsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Copyright & Legal */}
          <div className="px-2 text-[11px] text-zinc-400 leading-relaxed">
            <p>© 2026 Chubby Chat Inc. • Chat. Share. Connect.</p>
            <p className="mt-1 text-zinc-500">Privacy • Terms • Safety • API</p>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <CommentsDrawer
        post={activeCommentsPost}
        isOpen={!!activeCommentsPost}
        onClose={() => setActiveCommentsPost(null)}
        onSelectUser={(userId) => {
          setActiveCommentsPost(null);
          onSelectUser(userId);
        }}
      />

      <PostOptionsModal
        post={activeOptionsPost}
        isOpen={!!activeOptionsPost}
        onClose={() => setActiveOptionsPost(null)}
        onOpenReport={() => {}}
      />

      <StoryViewerModal
        userStory={activeStoryUser}
        onClose={() => setActiveStoryUser(null)}
        onSelectUserStory={(story) => setActiveStoryUser(story)}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />
    </div>
  );
};
