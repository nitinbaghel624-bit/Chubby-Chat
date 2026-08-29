import React from 'react';
import { Plus } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { UserStories } from '../../types';

interface StoriesBarProps {
  onOpenCreateStory: () => void;
  onSelectUserStory: (story: UserStories) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onOpenCreateStory,
  onSelectUserStory,
}) => {
  const { currentUser } = useAuth();
  const { stories } = usePosts();

  // Filter own stories vs other friends
  const ownStory = stories.find((s) => s.userId === currentUser?.id);
  const friendStories = stories.filter((s) => s.userId !== currentUser?.id);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1">
        {/* Your Story Button */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
          <div className="relative group cursor-pointer" onClick={ownStory ? () => onSelectUserStory(ownStory) : onOpenCreateStory}>
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.displayName}
              size="lg"
              hasStory={!!ownStory}
              storyUnseen={ownStory?.hasUnseen}
            />
            {/* Add Plus Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateStory();
              }}
              className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-full text-white border-2 border-white dark:border-zinc-900 shadow-md hover:scale-110 active:scale-95 transition-transform"
              title="Add Story"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[64px] truncate text-center">
            {ownStory ? 'Your Story' : 'Add Story'}
          </span>
        </div>

        {/* Friends Stories */}
        {friendStories.map((story) => (
          <div
            key={story.userId}
            onClick={() => onSelectUserStory(story)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <Avatar
              src={story.user.avatar}
              alt={story.user.displayName}
              size="lg"
              hasStory={true}
              storyUnseen={story.hasUnseen}
            />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[64px] truncate text-center group-hover:text-pink-500 transition-colors">
              {story.user.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
