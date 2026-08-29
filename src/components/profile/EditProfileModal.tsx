import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AIService } from '../../services/aiService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);

  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  ];

  const handleGenerateBioAI = async () => {
    setIsGeneratingBio(true);
    try {
      const generated = await AIService.suggestBio(
        `${displayName}, interest in design, social creativity and community vibes`
      );
      setBio(generated);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSave = () => {
    updateProfile({
      displayName: displayName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      website: website.trim(),
      avatar,
      isPrivate,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="lg">
      <div className="flex flex-col gap-5">
        {/* Avatar picker */}
        <div className="flex items-center gap-4">
          <Avatar src={avatar} size="xl" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Choose Avatar
            </span>
            <div className="flex items-center gap-2">
              {sampleAvatars.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                    avatar === av ? 'border-pink-500 scale-110' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Name & Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Bio with AI assist */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Bio
            </label>
            <button
              type="button"
              onClick={handleGenerateBioAI}
              disabled={isGeneratingBio}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              {isGeneratingBio ? 'Generating...' : 'AI Bio Polish'}
            </button>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="p-3 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>

        {/* Website link */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Website URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourlink.me"
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              Private Account
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Only people you approve can see your posts and stories
            </span>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded text-pink-500 focus:ring-pink-500 w-4 h-4"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
