import React from 'react';
import { Home, Compass, Film, MessageCircle, PlusCircle } from 'lucide-react';
import { NavTab } from './Sidebar';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreatePost: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreatePost,
}) => {
  const { currentUser } = useAuth();
  const { unreadTotal } = useChat();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800/80 px-4 flex items-center justify-around z-40 select-none pb-safe">
      {/* Home */}
      <button
        onClick={() => onSelectTab('feed')}
        className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-colors ${
          activeTab === 'feed'
            ? 'text-pink-500'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <Home className={`w-6 h-6 ${activeTab === 'feed' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
      </button>

      {/* Explore */}
      <button
        onClick={() => onSelectTab('explore')}
        className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-colors ${
          activeTab === 'explore'
            ? 'text-pink-500'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <Compass className={`w-6 h-6 ${activeTab === 'explore' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
      </button>

      {/* Floating Plus Compose Button */}
      <button
        onClick={onOpenCreatePost}
        className="p-1 rounded-full text-white bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
      >
        <PlusCircle className="w-8 h-8 stroke-[2]" />
      </button>

      {/* Reels */}
      <button
        onClick={() => onSelectTab('reels')}
        className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-colors ${
          activeTab === 'reels'
            ? 'text-pink-500'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <Film className={`w-6 h-6 ${activeTab === 'reels' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
      </button>

      {/* Messages */}
      <button
        onClick={() => onSelectTab('messages')}
        className={`relative p-2 rounded-2xl flex flex-col items-center justify-center transition-colors ${
          activeTab === 'messages'
            ? 'text-pink-500'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <MessageCircle
          className={`w-6 h-6 ${activeTab === 'messages' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
        />
        {unreadTotal > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white dark:ring-zinc-950" />
        )}
      </button>

      {/* Profile */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`p-1 rounded-full transition-transform ${
          activeTab === 'profile' ? 'ring-2 ring-pink-500' : 'opacity-80'
        }`}
      >
        <Avatar src={currentUser?.avatar} size="xs" />
      </button>
    </nav>
  );
};
