import React from 'react';
import { Heart, Sparkles, Sun, Moon, Search, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { NavTab } from './Sidebar';

interface TopBarProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenAIAssistant: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSelectTab, onOpenAIAssistant }) => {
  const { currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const unreadNotifs = currentUser
    ? StorageService.getNotifications(currentUser.id).filter((n) => !n.isRead).length
    : 0;

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 flex items-center justify-between z-30 select-none">
      {/* Brand */}
      <div
        onClick={() => onSelectTab('feed')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
          <span className="text-sm font-black text-white">C</span>
        </div>
        <span className="font-display font-black text-lg text-zinc-900 dark:text-white tracking-tight">
          Chubby<span className="text-pink-500">Chat</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* People Nearby */}
        <button
          onClick={() => onSelectTab('nearby')}
          className="relative p-2 rounded-full text-pink-600 dark:text-pink-400 hover:bg-pink-500/10 transition-colors"
          title="People Nearby"
        >
          <MapPin className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        </button>

        {/* Search */}
        <button
          onClick={() => onSelectTab('explore')}
          className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* AI Assistant */}
        <button
          onClick={onOpenAIAssistant}
          className="p-2 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
          title="AI Studio Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <Heart className="w-5 h-5" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white dark:ring-zinc-950" />
          )}
        </button>
      </div>
    </header>
  );
};
