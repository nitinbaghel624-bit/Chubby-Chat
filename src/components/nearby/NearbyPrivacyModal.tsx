import React from 'react';
import { X, Shield, Lock, Eye, MessageSquare, Users, Check, AlertCircle } from 'lucide-react';
import { NearbySettings } from '../../types';
import { Button } from '../common/Button';

interface NearbyPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NearbySettings;
  onUpdateSettings: (newSettings: NearbySettings) => void;
}

export const NearbyPrivacyModal: React.FC<NearbyPrivacyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof NearbySettings, val: any) => {
    onUpdateSettings({
      ...settings,
      [key]: val,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="nearby-privacy-modal"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                People Nearby Privacy
              </h3>
              <p className="text-xs text-zinc-400">Control your visibility and discovery rules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Main Privacy Notice */}
          <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300">
            <Lock className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-pink-600 dark:text-pink-400 block mb-0.5">
                Privacy Guarantee
              </span>
              When enabled, people nearby may discover your approximate location. Your exact coordinates, street address, and live track are never shared or stored.
            </div>
          </div>

          {/* Toggle 1: Show me to nearby people */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-pink-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Show me to nearby people
                </span>
                <span className="text-[11px] text-zinc-500">
                  Allow active people within your radius to discover your profile card.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-nearby-enabled"
              checked={settings.isEnabled}
              onChange={(e) => handleToggle('isEnabled', e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
            />
          </div>

          {/* Toggle 2: Show approximate distance */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Show approximate distance
                </span>
                <span className="text-[11px] text-zinc-500">
                  Displays coarse proximity (e.g. &quot;~800 m away&quot;) rather than general &quot;Nearby&quot;.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-approx-distance"
              checked={settings.showApproximateDistance}
              onChange={(e) => handleToggle('showApproximateDistance', e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
            />
          </div>

          {/* Toggle 3: Allow nearby people to message me */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Allow nearby people to message me
                </span>
                <span className="text-[11px] text-zinc-500">
                  Allow newly discovered nearby users to send you message requests.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-nearby-messages"
              checked={settings.allowNearbyMessages}
              onChange={(e) => handleToggle('allowNearbyMessages', e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
            />
          </div>

          {/* Toggle 4: Only show people I follow */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Only show people I follow
                </span>
                <span className="text-[11px] text-zinc-500">
                  Restrict nearby discovery list strictly to accounts you already follow.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-following-only"
              checked={settings.onlyShowPeopleIFollow}
              onChange={(e) => handleToggle('onlyShowPeopleIFollow', e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done & Save
          </Button>
        </div>
      </div>
    </div>
  );
};
