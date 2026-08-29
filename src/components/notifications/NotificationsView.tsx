import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Sparkles,
  CheckCheck,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem, NotificationType } from '../../types';
import { StorageService } from '../../services/storageService';

interface NotificationsViewProps {
  onSelectUser: (userId: string) => void;
  onSelectPost?: (postId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectUser,
  onSelectPost,
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    currentUser ? StorageService.getNotifications(currentUser.id) : []
  );
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'mentions'>('all');

  const handleMarkAllAsRead = () => {
    if (!currentUser) return;
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    StorageService.saveNotifications(currentUser.id, updated);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'likes') return n.type === 'like_post' || n.type === 'like_reel';
    if (filter === 'comments') return n.type === 'comment_post' || n.type === 'story_reply';
    if (filter === 'follows') return n.type === 'follow';
    if (filter === 'mentions') return n.type === 'mention';
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'like_post':
      case 'like_reel':
        return <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />;
      case 'comment_post':
      case 'story_reply':
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-pink-500" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-emerald-500" />;
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
            Notifications
          </h2>

          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-4 pb-1">
          {(['all', 'likes', 'comments', 'follows', 'mentions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                  !item.isRead ? 'bg-pink-500/5 dark:bg-pink-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Actor Avatar with Type Badge */}
                  <div className="relative cursor-pointer" onClick={() => onSelectUser(item.actor.id)}>
                    <Avatar
                      src={item.actor.avatar}
                      size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-zinc-900 shadow-sm">
                      {getIcon(item.type)}
                    </div>
                  </div>

                  <div className="flex flex-col text-xs text-zinc-800 dark:text-zinc-200 leading-snug">
                    <p>
                      <span
                        onClick={() => onSelectUser(item.actor.id)}
                        className="font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline mr-1"
                      >
                        {item.actor.displayName}
                      </span>
                      <span>{item.title}</span>
                    </p>
                    {item.body && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.body}
                      </p>
                    )}
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Target preview thumbnail */}
                {item.targetPreview && (
                  <div
                    onClick={() => item.targetId && onSelectPost && onSelectPost(item.targetId)}
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                  >
                    <img
                      src={item.targetPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
