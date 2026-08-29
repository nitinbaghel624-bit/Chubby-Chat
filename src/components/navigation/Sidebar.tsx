import React from 'react';
import {
  Home,
  Compass,
  Film,
  MessageCircle,
  Heart,
  Bookmark,
  PlusSquare,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Users,
  Settings,
  MapPin,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';

export type NavTab =
  | 'feed'
  | 'explore'
  | 'nearby'
  | 'reels'
  | 'messages'
  | 'notifications'
  | 'saved'
  | 'profile'
  | 'settings'
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreatePost: () => void;
  onOpenAIAssistant: () => void;
  onOpenAuthModal: () => void;
  onSelectUserProfile?: (userId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreatePost,
  onOpenAIAssistant,
  onOpenAuthModal,
}) => {
  const { currentUser, switchUser, allUsers } = useAuth();
  const { unreadTotal } = useChat();
  const { isDark, toggleTheme } = useTheme();

  const [showSwitchMenu, setShowSwitchMenu] = React.useState(false);

  // Unread notification count
  const unreadNotifs = currentUser
    ? StorageService.getNotifications(currentUser.id).filter((n) => !n.isRead).length
    : 0;

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'nearby', label: 'People Nearby', icon: MapPin, highlight: true },
    { id: 'reels', label: 'Reels', icon: Film },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Heart,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Desk', icon: ShieldCheck });
  }

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 p-4 lg:p-6 select-none z-30 shrink-0">
      {/* Top Header & Brand */}
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-3 cursor-pointer group py-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
            <span className="text-xl font-black text-white tracking-wider">C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors">
              Chubby<span className="text-pink-500">Chat</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400">
              Chat • Share • Connect
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-pink-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Assistant Quick Tool */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/15 transition-all group"
          >
            <Sparkles className="w-5 h-5 text-purple-500 group-hover:rotate-12 transition-transform" />
            <span>AI Studio Tools</span>
          </button>
        </nav>

        {/* Create Post Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusSquare className="w-5 h-5 stroke-[2.5]" />
          <span>New Post</span>
        </button>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        {/* Theme switcher */}
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>Appearance</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="text-[11px] capitalize">{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {/* Current User Card with Switcher */}
        {currentUser ? (
          <div className="relative">
            <div
              onClick={() => onSelectTab('profile')}
              className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                activeTab === 'profile' ? 'ring-2 ring-pink-500/30 bg-zinc-50 dark:bg-zinc-900' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  size="md"
                  status={currentUser.status}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {currentUser.displayName}
                    </span>
                    {currentUser.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-xs text-zinc-400 truncate">@{currentUser.username}</span>
                </div>
              </div>

              {/* Demo Account Switcher Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSwitchMenu(!showSwitchMenu);
                }}
                title="Switch Demo Profile"
                className="p-2 rounded-xl text-zinc-400 hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>

            {/* Switch User Flyout */}
            {showSwitchMenu && (
              <div className="absolute bottom-16 left-0 right-0 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 flex flex-col gap-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Switch Active Account
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowSwitchMenu(false);
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-pink-500/10 text-pink-500'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Avatar src={u.avatar} size="xs" />
                    <span className="truncate flex-1">{u.displayName}</span>
                    {u.isAdmin && <span className="text-[9px] text-purple-400 font-bold">ADMIN</span>}
                  </button>
                ))}
                <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setShowSwitchMenu(false);
                      onOpenAuthModal();
                    }}
                    className="flex items-center gap-2 w-full p-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-pink-600 bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
          >
            Log In / Sign Up
          </button>
        )}
      </div>
    </aside>
  );
};
