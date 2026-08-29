import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Compass,
  Radio,
  Shield,
  Lock,
  RefreshCw,
  Search,
  Sliders,
  Users,
  Sparkles,
  AlertTriangle,
  Settings,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { NearbyUser, NearbySettings, NearbyRadius, User } from '../../types';
import { NearbyService } from '../../services/nearbyService';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { NearbyUserCard } from './NearbyUserCard';
import { NearbyPrivacyModal } from './NearbyPrivacyModal';
import { NearbyIcebreakerModal } from './NearbyIcebreakerModal';

interface NearbyPeopleViewProps {
  onSelectUser: (userId: string) => void;
  onOpenMessages?: () => void;
}

export const NearbyPeopleView: React.FC<NearbyPeopleViewProps> = ({
  onSelectUser,
  onOpenMessages,
}) => {
  const { currentUser, toggleFollow, blockUser } = useAuth();
  const { startDirectChat, sendMessage } = useChat();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<NearbySettings>(() =>
    currentUser
      ? StorageService.getNearbySettings(currentUser.id)
      : {
          isEnabled: false,
          showApproximateDistance: true,
          allowNearbyMessages: true,
          onlyShowPeopleIFollow: false,
          radiusKm: 5,
        }
  );

  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'
  >('idle');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'interests' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [icebreakerTarget, setIcebreakerTarget] = useState<NearbyUser | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Load nearby people
  const fetchNearby = useCallback(
    (coords: { lat: number; lng: number } | null, currentSettings: NearbySettings) => {
      if (!currentUser) return;
      if (!currentSettings.isEnabled || !coords) {
        setNearbyUsers([]);
        return;
      }

      setLoading(true);
      // Simulate quick natural network turnaround
      setTimeout(() => {
        const res = NearbyService.getNearbyActivePeople(currentUser, coords, currentSettings, {
          filter: activeFilter,
          searchQuery,
        });

        setNearbyUsers(res.users);
        setLoading(false);
      }, 250);
    },
    [currentUser, activeFilter, searchQuery]
  );

  // Request location and activate discovery
  const handleEnableDiscovery = async () => {
    if (!currentUser) return;
    setLocationStatus('requesting');
    setLoading(true);

    const { coords, status } = await NearbyService.requestDeviceLocation();
    setLocationStatus(status);

    if (status === 'granted' || status === 'unavailable') {
      setUserCoords(coords);
      const updatedSettings: NearbySettings = { ...settings, isEnabled: true };
      setSettings(updatedSettings);
      StorageService.saveNearbySettings(currentUser.id, updatedSettings);

      // Publish presence
      NearbyService.publishUserPresence(currentUser.id, coords, 'online');
      fetchNearby(coords, updatedSettings);
      showToast('People Nearby discovery enabled! 🧭');
    } else if (status === 'denied') {
      showToast('Location permission is required for People Nearby.', 'error');
    }
    setLoading(false);
  };

  // Turn off discovery immediately
  const handleDisableDiscovery = () => {
    if (!currentUser) return;
    const updatedSettings: NearbySettings = { ...settings, isEnabled: false };
    setSettings(updatedSettings);
    StorageService.saveNearbySettings(currentUser.id, updatedSettings);
    StorageService.clearUserPresence(currentUser.id);
    setNearbyUsers([]);
    showToast('People Nearby discovery disabled. Your presence was removed.');
  };

  // Radius change handler
  const handleChangeRadius = (radius: NearbyRadius) => {
    if (!currentUser) return;
    const updatedSettings: NearbySettings = { ...settings, radiusKm: radius };
    setSettings(updatedSettings);
    StorageService.saveNearbySettings(currentUser.id, updatedSettings);
    if (userCoords) {
      fetchNearby(userCoords, updatedSettings);
    }
    showToast(`Discovery radius set to ${radius >= 1 ? `${radius} km` : `${radius * 1000} m`}`);
  };

  // Manual refresh with rate limit
  const handleRefresh = () => {
    if (cooldown > 0) {
      showToast(`Please wait ${cooldown}s before refreshing again.`, 'info');
      return;
    }
    if (!userCoords) {
      handleEnableDiscovery();
      return;
    }

    NearbyService.recordRefresh();
    setCooldown(4);
    fetchNearby(userCoords, settings);
    showToast('Refreshed nearby active people ✨');
  };

  // Save settings update from modal
  const handleUpdateSettings = (newSettings: NearbySettings) => {
    if (!currentUser) return;
    setSettings(newSettings);
    StorageService.saveNearbySettings(currentUser.id, newSettings);
    if (newSettings.isEnabled && userCoords) {
      fetchNearby(userCoords, newSettings);
    } else if (!newSettings.isEnabled) {
      setNearbyUsers([]);
    }
    showToast('Privacy preferences updated.');
  };

  // Follow button handler
  const handleToggleFollow = (userId: string) => {
    toggleFollow(userId);
    if (userCoords) {
      fetchNearby(userCoords, settings);
    }
  };

  // Block user handler
  const handleBlockUser = (userId: string) => {
    blockUser(userId);
    if (userCoords) {
      fetchNearby(userCoords, settings);
    }
  };

  // Start chat with user
  const handleStartChat = (targetUser: NearbyUser) => {
    const fullUser = StorageService.getUserById(targetUser.id);
    if (fullUser) {
      startDirectChat(fullUser);
      if (onOpenMessages) {
        onOpenMessages();
      } else {
        showToast(`Opening chat with @${targetUser.username}...`);
      }
    }
  };

  // Send AI icebreaker
  const handleSendIcebreaker = (messageText: string) => {
    if (!icebreakerTarget) return;
    const fullUser = StorageService.getUserById(icebreakerTarget.id);
    if (fullUser) {
      const conv = startDirectChat(fullUser);
      sendMessage(messageText);
      showToast(`Icebreaker sent to @${icebreakerTarget.username}! 🚀`);
      if (onOpenMessages) {
        onOpenMessages();
      }
    }
  };

  // Auto initialize if already enabled
  useEffect(() => {
    if (settings.isEnabled && !userCoords) {
      NearbyService.requestDeviceLocation().then(({ coords, status }) => {
        setLocationStatus(status);
        if (status === 'granted' || status === 'unavailable') {
          setUserCoords(coords);
          if (currentUser) {
            NearbyService.publishUserPresence(currentUser.id, coords, 'online');
          }
          fetchNearby(coords, settings);
        }
      });
    }
  }, [settings.isEnabled, currentUser, fetchNearby, userCoords]);

  // Refetch when filters or search change
  useEffect(() => {
    if (settings.isEnabled && userCoords) {
      fetchNearby(userCoords, settings);
    }
  }, [activeFilter, searchQuery, settings, userCoords, fetchNearby]);

  const radiusOptions: NearbyRadius[] = [0.5, 1, 5, 10, 25];

  return (
    <div id="nearby-people-view" className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl md:text-3xl text-zinc-900 dark:text-white tracking-tight">
                  People Nearby
                </h1>
                {settings.isEnabled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Discover active people around you
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Refresh Button */}
          {settings.isEnabled && (
            <button
              id="btn-refresh-nearby"
              onClick={handleRefresh}
              disabled={loading || cooldown > 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Refresh'}</span>
            </button>
          )}

          {/* Privacy Settings Trigger */}
          <button
            id="btn-nearby-privacy-settings"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Controls</span>
          </button>
        </div>
      </div>

      {/* Main Privacy Notice Pill */}
      <div className="mb-6 p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-pink-500 shrink-0" />
          <span>
            <strong className="text-zinc-900 dark:text-white">Strict Privacy Protected:</strong>{' '}
            Your exact GPS coordinates, address, and live track are NEVER shared. Only approximate distances are shown.
          </span>
        </div>

        {settings.isEnabled && (
          <button
            onClick={handleDisableDiscovery}
            className="text-[11px] font-bold text-rose-500 hover:underline shrink-0"
          >
            Turn Off Discovery
          </button>
        )}
      </div>

      {/* State 1: Discovery is Disabled (Opt-in Required) */}
      {!settings.isEnabled ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/25">
            <Compass className="w-10 h-10 stroke-[1.75]" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-display font-black text-2xl text-zinc-900 dark:text-white">
              Connect With People Nearby
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              Discover other Chubby Chat users who are currently active in your neighborhood, share common hobbies, and spark new conversations.
            </p>
          </div>

          {/* Privacy bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left my-2">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 dark:text-zinc-300">
                <strong className="block text-zinc-900 dark:text-white mb-0.5">Approximate Proximity</strong>
                Distances are rounded to safe intervals (~800 m, ~1.5 km).
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 dark:text-zinc-300">
                <strong className="block text-zinc-900 dark:text-white mb-0.5">Auto-Expiring Presence</strong>
                Locations automatically expire after 15 minutes of inactivity.
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            id="btn-enable-nearby"
            size="lg"
            variant="primary"
            onClick={handleEnableDiscovery}
            isLoading={loading}
            className="w-full sm:w-auto px-8"
            leftIcon={<Radio className="w-4 h-4" />}
          >
            Turn On Nearby Discovery
          </Button>

          <span className="text-[11px] text-zinc-400">
            You can turn this off anytime in your Privacy settings with 1 tap.
          </span>
        </div>
      ) : locationStatus === 'denied' ? (
        /* State 2: Permission Denied State */
        <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
              Location Permission Required
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
              Chubby Chat uses your approximate location to find active people nearby. Your exact location is never shown to other users.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleEnableDiscovery}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry Permission
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUserCoords({ lat: 37.7749, lng: -122.4194 });
                setLocationStatus('granted');
                fetchNearby({ lat: 37.7749, lng: -122.4194 }, settings);
              }}
            >
              Explore Demo Area
            </Button>
          </div>
        </div>
      ) : (
        /* State 3: Active Discovery View */
        <div className="flex flex-col gap-6">
          {/* Controls Bar: Radius & Filter Chips & Search */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 md:p-5 shadow-sm flex flex-col gap-4">
            {/* Top row: Radius selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                <Sliders className="w-4 h-4 text-pink-500" />
                <span>Discovery Radius</span>
              </div>

              {/* Radius Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {radiusOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChangeRadius(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.radiusKm === r
                        ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {r < 1 ? `${r * 1000} m` : `${r} km`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom row: Filter tabs & Search input */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeFilter === 'all'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  All ({nearbyUsers.length})
                </button>

                <button
                  onClick={() => setActiveFilter('online')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeFilter === 'online'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Online Now</span>
                </button>

                <button
                  onClick={() => setActiveFilter('interests')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeFilter === 'interests'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mutual Interests</span>
                </button>

                <button
                  onClick={() => setActiveFilter('following')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeFilter === 'following'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Following</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by interest or name..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white border-0 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* User Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm animate-pulse flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="w-28 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      <div className="w-20 h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-10 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="flex-1 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyUsers.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 text-center max-w-lg mx-auto shadow-sm flex flex-col items-center gap-4 my-6">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Compass className="w-8 h-8 stroke-[1.75]" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display font-black text-xl text-zinc-900 dark:text-white">
                  No active people nearby
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Try increasing your discovery radius or check again later.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <Button
                  id="btn-change-radius-empty"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const nextRadius: NearbyRadius =
                      settings.radiusKm < 5 ? 5 : settings.radiusKm < 10 ? 10 : 25;
                    handleChangeRadius(nextRadius);
                  }}
                >
                  Change Radius
                </Button>

                <Button
                  id="btn-refresh-empty"
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyUsers.map((user) => (
                <NearbyUserCard
                  key={user.id}
                  user={user}
                  onSelectUser={onSelectUser}
                  onStartChat={handleStartChat}
                  onToggleFollow={handleToggleFollow}
                  onOpenIcebreaker={(u) => setIcebreakerTarget(u)}
                  onBlockUser={handleBlockUser}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Privacy Modal */}
      <NearbyPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* AI Icebreaker Opener Modal */}
      <NearbyIcebreakerModal
        isOpen={!!icebreakerTarget}
        onClose={() => setIcebreakerTarget(null)}
        targetUser={icebreakerTarget}
        onSendIcebreaker={handleSendIcebreaker}
      />
    </div>
  );
};
