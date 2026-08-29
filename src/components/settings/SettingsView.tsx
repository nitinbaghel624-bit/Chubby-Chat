import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Moon,
  Sun,
  UserX,
  Volume2,
  Lock,
  LogOut,
  Trash2,
  Download,
  Smartphone,
  Eye,
  Check,
  MapPin,
  Compass,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { NearbySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'account' | 'privacy' | 'nearby' | 'notifications' | 'appearance'
  >('account');

  const [nearbySettings, setNearbySettings] = useState<NearbySettings>(() =>
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

  const handleTogglePrivate = (val: boolean) => {
    setIsPrivate(val);
    updateProfile({ isPrivate: val });
    showToast(`Account privacy updated to ${val ? 'Private' : 'Public'}`);
  };

  const handleUpdateNearby = (key: keyof NearbySettings, val: any) => {
    if (!currentUser) return;
    const updated = { ...nearbySettings, [key]: val };
    setNearbySettings(updated);
    StorageService.saveNearbySettings(currentUser.id, updated);
    showToast('People Nearby settings saved.');
  };

  const handleExportData = () => {
    const data = StorageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chubby-chat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Your data export archive has downloaded! 📦');
  };

  const handleResetApp = () => {
    if (window.confirm('Reset all demo data to default initial state?')) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors shrink-0 md:w-full ${
              activeTab === 'account'
                ? 'bg-pink-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Account & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors shrink-0 md:w-full ${
              activeTab === 'privacy'
                ? 'bg-pink-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy & Sharing</span>
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors shrink-0 md:w-full ${
              activeTab === 'nearby'
                ? 'bg-pink-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>People Nearby</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors shrink-0 md:w-full ${
              activeTab === 'notifications'
                ? 'bg-pink-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Sounds</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors shrink-0 md:w-full ${
              activeTab === 'appearance'
                ? 'bg-pink-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <div className="hidden md:block my-4 border-t border-zinc-100 dark:border-zinc-800" />

          <button
            onClick={logout}
            className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'account' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Account Settings
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage your personal credentials, email, and connected sessions.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || 'alex@chubbychat.app'}
                    className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Active Login Session
                  </label>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          Chrome on MacOS (This device)
                        </span>
                        <span className="text-[11px] text-emerald-500 font-semibold">
                          • Active now in San Francisco, CA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Data & Export
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportData}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Export My Data (JSON)
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleResetApp}
                      leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
                    >
                      Reset App Defaults
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Privacy Controls
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Control who sees your posts, stories, and active online status.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Private Account
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      When your account is private, only people you approve can see your posts and stories.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => handleTogglePrivate(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Show Activity Status
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      Allow accounts you follow to see when you were last active on Chubby Chat.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  People Nearby Discovery
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage discovery preferences, approximate radius, and safety controls.
                </p>
              </div>

              {/* Strict Privacy Banner */}
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <Lock className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-pink-600 dark:text-pink-400 block mb-0.5">
                    Privacy Protection
                  </span>
                  When enabled, people nearby may discover your approximate location. Your exact coordinates and address are never shared.
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Toggle 1: Show me to nearby people */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Show me to nearby people
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      Allow other active users within your radius to discover your card in People Nearby.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nearbySettings.isEnabled}
                    onChange={(e) => handleUpdateNearby('isEnabled', e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
                  />
                </div>

                {/* Toggle 2: Show approximate distance */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Show approximate distance
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      Display coarse proximity (e.g. &quot;~800 m away&quot;) rather than general &quot;Nearby&quot;.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nearbySettings.showApproximateDistance}
                    onChange={(e) => handleUpdateNearby('showApproximateDistance', e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
                  />
                </div>

                {/* Toggle 3: Allow nearby messages */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Allow nearby people to message me
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      Allow people who discover your profile nearby to send you a message request.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nearbySettings.allowNearbyMessages}
                    onChange={(e) => handleUpdateNearby('allowNearbyMessages', e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
                  />
                </div>

                {/* Toggle 4: Only show people I follow */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Only show people I follow
                    </span>
                    <span className="text-xs text-zinc-500 max-w-sm mt-0.5">
                      Restrict your nearby list strictly to accounts that you already follow.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nearbySettings.onlyShowPeopleIFollow}
                    onChange={(e) => handleUpdateNearby('onlyShowPeopleIFollow', e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Notifications & Audio
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Customize in-app sounds, ringtones, and push notifications.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-pink-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Web Audio Sound Effects
                      </span>
                      <span className="text-xs text-zinc-500">
                        Plays soft pops when sending messages, liking posts, and ringing calls.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundsEnabled}
                    onChange={(e) => setSoundsEnabled(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Push Notifications
                      </span>
                      <span className="text-xs text-zinc-500">
                        Receive instant alerts for new direct messages and mentions.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Appearance & Theme
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Select your preferred color mode for high-contrast comfort.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-600'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-bold">Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs font-bold">Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    theme === 'system'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-zinc-400" />
                  <span className="text-xs font-bold">System Auto</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
