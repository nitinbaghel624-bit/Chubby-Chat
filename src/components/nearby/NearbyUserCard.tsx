import React, { useState } from 'react';
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  Sparkles,
  MoreHorizontal,
  Users,
  Lock,
  Compass,
} from 'lucide-react';
import { NearbyUser } from '../../types';
import { Avatar } from '../common/Avatar';
import { VerifiedBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface NearbyUserCardProps {
  user: NearbyUser;
  onSelectUser: (userId: string) => void;
  onStartChat: (user: NearbyUser) => void;
  onToggleFollow: (userId: string) => void;
  onOpenIcebreaker: (user: NearbyUser) => void;
  onBlockUser?: (userId: string) => void;
}

export const NearbyUserCard: React.FC<NearbyUserCardProps> = ({
  user,
  onSelectUser,
  onStartChat,
  onToggleFollow,
  onOpenIcebreaker,
  onBlockUser,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      id={`nearby-card-${user.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-md hover:border-pink-500/30 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Background Gradient Glow */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-80" />

      {/* Main Info Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar and Info */}
          <div
            onClick={() => onSelectUser(user.id)}
            className="flex items-center gap-3.5 cursor-pointer min-w-0 flex-1"
          >
            <div className="relative shrink-0">
              <Avatar
                src={user.avatar}
                alt={user.displayName}
                size="lg"
                status={user.status === 'online' ? 'online' : undefined}
              />
              {user.status === 'online' ? (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
              ) : (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-zinc-900 dark:text-white truncate group-hover:text-pink-500 transition-colors">
                  {user.displayName}
                </span>
                {user.isVerified && <VerifiedBadge size="sm" />}
                {user.isPrivate && (
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" title="Private Account" />
                )}
              </div>
              <span className="text-xs text-zinc-400 font-medium truncate">
                @{user.username}
              </span>

              {/* Proximity & Activity Status Badge */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    user.status === 'online'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                  {user.activeText}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <Compass className="w-3 h-3" />
                  {user.approximateDistance}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu Button */}
          <div className="relative">
            <button
              id={`btn-menu-${user.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onSelectUser(user.id);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenIcebreaker(user);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Icebreaker</span>
                </button>

                {onBlockUser && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onBlockUser(user.id);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <span>Block User</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Bio */}
        {user.bio && (
          <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-3">
            {user.bio}
          </p>
        )}

        {/* Interests & Shared Tags */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {user.interests.slice(0, 4).map((interest) => {
              const isMutual = user.mutualInterests?.includes(interest);
              return (
                <span
                  key={interest}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    isMutual
                      ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
                  }`}
                >
                  {isMutual && '✨ '}
                  {interest}
                </span>
              );
            })}
            {user.interests.length > 4 && (
              <span className="text-[10px] font-semibold text-zinc-400 self-center">
                +{user.interests.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Mutual Friends Banner */}
        {user.mutualFriendsCount !== undefined && user.mutualFriendsCount > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
            <Users className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="truncate font-medium">
              {user.mutualFriendsCount} mutual {user.mutualFriendsCount === 1 ? 'connection' : 'connections'}
              {user.mutualFriends && user.mutualFriends.length > 0 && (
                <span className="text-zinc-700 dark:text-zinc-300 font-bold ml-1">
                  (including @{user.mutualFriends[0].username})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        {/* Follow / Following Button */}
        <Button
          id={`btn-follow-${user.id}`}
          size="sm"
          variant={user.isFollowing ? 'secondary' : 'primary'}
          onClick={() => onToggleFollow(user.id)}
          className="flex-1 text-xs"
          leftIcon={
            user.isFollowing ? (
              <UserCheck className="w-3.5 h-3.5 text-pink-500" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )
          }
        >
          {user.isFollowing ? 'Following' : user.isFollowPending ? 'Requested' : 'Follow'}
        </Button>

        {/* Message Button */}
        {user.allowMessage ? (
          <Button
            id={`btn-message-${user.id}`}
            size="sm"
            variant="outline"
            onClick={() => onStartChat(user)}
            className="flex-1 text-xs"
            leftIcon={<MessageCircle className="w-3.5 h-3.5 text-pink-500" />}
          >
            Message
          </Button>
        ) : (
          <button
            disabled
            className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 text-xs font-semibold cursor-not-allowed"
            title="User restricted direct messages from nearby discovery"
          >
            Restricted
          </button>
        )}

        {/* AI Icebreaker Quick Starter */}
        <button
          id={`btn-icebreaker-${user.id}`}
          onClick={() => onOpenIcebreaker(user)}
          title="Generate AI Icebreaker Message"
          className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
