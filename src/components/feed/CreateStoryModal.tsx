import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Image, Sparkles, HelpCircle, BarChart2 } from 'lucide-react';
import { usePosts } from '../../context/PostContext';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { createStory } = usePosts();

  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80'
  );
  const [caption, setCaption] = useState('');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('Which vibe do you like better?');
  const [pollOptionA, setPollOptionA] = useState('Option 1 😍');
  const [pollOptionB, setPollOptionB] = useState('Option 2 🔥');

  const [hasQuestionPrompt, setHasQuestionPrompt] = useState(false);
  const [questionPrompt, setQuestionPrompt] = useState('Ask me anything today! ✨');

  const sampleImages = [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
  ];

  const handlePublish = () => {
    let pollData = undefined;
    if (hasPoll && pollQuestion.trim()) {
      pollData = {
        question: pollQuestion,
        options: [
          { text: pollOptionA || 'Yes', votes: 1 },
          { text: pollOptionB || 'No', votes: 0 },
        ],
      };
    }

    let questionData = undefined;
    if (hasQuestionPrompt && questionPrompt.trim()) {
      questionData = {
        prompt: questionPrompt,
        responses: [],
      };
    }

    createStory(mediaUrl, 'image', caption || undefined, pollData, questionData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Your Story" maxWidth="lg">
      <div className="flex flex-col gap-5">
        {/* Preview Container */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
          <img
            src={mediaUrl}
            alt="Story Preview"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Overlaid preview widgets */}
          {hasPoll && (
            <div className="absolute inset-x-6 bottom-16 p-3 bg-black/75 backdrop-blur-md rounded-2xl border border-white/20 text-white text-xs">
              <div className="font-bold text-center mb-2">{pollQuestion}</div>
              <div className="flex gap-2">
                <div className="flex-1 py-1.5 px-2 bg-white/20 rounded-xl text-center font-semibold">
                  {pollOptionA}
                </div>
                <div className="flex-1 py-1.5 px-2 bg-white/20 rounded-xl text-center font-semibold">
                  {pollOptionB}
                </div>
              </div>
            </div>
          )}

          {hasQuestionPrompt && (
            <div className="absolute inset-x-6 bottom-16 p-3 bg-purple-900/80 backdrop-blur-md rounded-2xl border border-purple-400/40 text-white text-xs text-center">
              <div className="font-bold">{questionPrompt}</div>
            </div>
          )}
        </div>

        {/* Sample preset selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Choose Background Photo
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {sampleImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMediaUrl(img)}
                className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  mediaUrl === img
                    ? 'border-pink-500 ring-2 ring-pink-500/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Image URL custom input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Or Paste Custom Image URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setMediaUrl(
                  `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&w=1080&q=80`
                )
              }
              leftIcon={<Image className="w-3.5 h-3.5" />}
            >
              Random
            </Button>
          </div>
        </div>

        {/* Caption */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Story Caption (Optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add quick caption or stickers ✨"
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Interactive Sticker Toggles */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setHasPoll(!hasPoll);
              if (hasQuestionPrompt) setHasQuestionPrompt(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              hasPoll
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Add Poll</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHasQuestionPrompt(!hasQuestionPrompt);
              if (hasPoll) setHasPoll(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              hasQuestionPrompt
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>AMA Question Box</span>
          </button>
        </div>

        {/* Poll Customization */}
        {hasPoll && (
          <div className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={pollOptionA}
                onChange={(e) => setPollOptionA(e.target.value)}
                placeholder="Option A"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              />
              <input
                type="text"
                value={pollOptionB}
                onChange={(e) => setPollOptionB(e.target.value)}
                placeholder="Option B"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              />
            </div>
          </div>
        )}

        {/* Question Box Customization */}
        {hasQuestionPrompt && (
          <div className="flex flex-col gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/50">
            <input
              type="text"
              value={questionPrompt}
              onChange={(e) => setQuestionPrompt(e.target.value)}
              placeholder="Prompt (e.g. Ask me anything!)..."
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-700"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handlePublish} leftIcon={<Sparkles className="w-4 h-4" />}>
            Share to Story
          </Button>
        </div>
      </div>
    </Modal>
  );
};
