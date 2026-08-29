import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, RefreshCw, Copy, Check } from 'lucide-react';
import { NearbyUser } from '../../types';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useToast } from '../../context/ToastContext';

interface NearbyIcebreakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: NearbyUser | null;
  onSendIcebreaker: (message: string) => void;
}

export const NearbyIcebreakerModal: React.FC<NearbyIcebreakerModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSendIcebreaker,
}) => {
  const { showToast } = useToast();
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customText, setCustomText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchIcebreakers = async () => {
    if (!targetUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/nearby-icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: targetUser.displayName,
          targetBio: targetUser.bio,
          mutualInterests: targetUser.mutualInterests,
          approximateDistance: targetUser.approximateDistance,
        }),
      });
      const data = await res.json();
      if (data.icebreakers && Array.isArray(data.icebreakers)) {
        setIcebreakers(data.icebreakers);
      }
    } catch (e) {
      console.error('Failed to load icebreakers:', e);
      setIcebreakers([
        `Hey ${targetUser.displayName}! Saw you're active nearby and love ${
          targetUser.interests?.[0] || 'good vibes'
        }! How's your week going? ✨`,
        `Hey! Loved your profile. Hope you're having an awesome day! 👋`,
        `Hey ${targetUser.displayName}! Great to connect with friendly people around here! ☕️`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetUser) {
      setCustomText('');
      fetchIcebreakers();
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleSelectIcebreaker = (text: string) => {
    setCustomText(text);
  };

  const handleSend = () => {
    if (!customText.trim()) {
      showToast('Please select or type an icebreaker message first.', 'error');
      return;
    }
    onSendIcebreaker(customText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="nearby-icebreaker-modal"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                AI Nearby Icebreaker
              </h3>
              <p className="text-xs text-zinc-400">
                Friendly conversation starters for @{targetUser.username}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target User Banner */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <Avatar src={targetUser.avatar} size="md" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
              {targetUser.displayName}
            </span>
            <span className="text-xs text-zinc-500">
              {targetUser.approximateDistance} • {targetUser.activeText}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Suggested Icebreakers
            </span>
            <button
              onClick={fetchIcebreakers}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-600 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 py-4">
              <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {icebreakers.map((starter, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectIcebreaker(starter)}
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed cursor-pointer transition-all ${
                    customText === starter
                      ? 'border-pink-500 bg-pink-500/10 text-zinc-900 dark:text-white font-medium ring-2 ring-pink-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <p>{starter}</p>
                </div>
              ))}
            </div>
          )}

          {/* Editable message box */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Customize your opener:
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Select an option above or type your own friendly message..."
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!customText.trim()}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};
