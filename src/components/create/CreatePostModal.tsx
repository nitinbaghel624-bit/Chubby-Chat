import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Image,
  Sparkles,
  MapPin,
  Music,
  Users,
  Eye,
  Sliders,
  Plus,
  Trash2,
} from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import { AIService } from '../../services/aiService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILTERS = [
  { id: 'normal', name: 'Normal', css: '' },
  { id: 'vivid', name: 'Vivid', css: 'saturate-150 contrast-110' },
  { id: 'vintage', name: 'Vintage', css: 'sepia-[0.35] contrast-95 brightness-95' },
  { id: 'noir', name: 'Noir', css: 'grayscale contrast-125' },
  { id: 'warm', name: 'Warm Sunset', css: 'hue-rotate-15 saturate-125 brightness-105' },
  { id: 'cool', name: 'Cool Mist', css: 'hue-rotate-180 saturate-90 brightness-95' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost } = usePosts();

  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#ChubbyChat', '#Create', '#Vibes']);
  const [location, setLocation] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [audience, setAudience] = useState<'public' | 'followers' | 'close_friends'>('public');
  const [allowComments, setAllowComments] = useState(true);

  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<'engaging' | 'funny' | 'aesthetic' | 'professional' | 'hyped'>('aesthetic');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const presetImages = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
  ];

  const handleGenerateCaption = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await AIService.generateCaption({
        topic: aiTopic || 'aesthetic moment and creative inspiration',
        tone: aiTone,
      });
      setCaption(result.caption);
      if (result.suggestedHashtags?.length) {
        setHashtags(Array.from(new Set([...hashtags, ...result.suggestedHashtags])));
      }
      setShowAIAssistant(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddImage = (url: string) => {
    if (images.length < 5) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleAddHashtag = (tag: string) => {
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(formatted)) {
      setHashtags([...hashtags, formatted]);
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    createPost({
      media: images.map((url, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        type: 'image',
        url,
        filter: selectedFilter,
        aspectRatio: '4:5',
      })),
      caption,
      hashtags,
      location: location.trim() || undefined,
      music:
        musicTitle.trim()
          ? { title: musicTitle.trim(), artist: musicArtist.trim() || 'Featured Audio' }
          : undefined,
      audience,
      allowComments,
      allowSharing: true,
    });
    onClose();
  };

  const currentFilterObj = FILTERS.find((f) => f.id === selectedFilter);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Post" maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image Preview & Filter Palette */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {/* Main Media Preview */}
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <img
              src={images[0]}
              alt="Post preview"
              className={`w-full h-full object-cover transition-all duration-300 ${currentFilterObj?.css}`}
              referrerPolicy="no-referrer"
            />
            {images.length > 1 && (
              <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white">
                1 / {images.length}
              </span>
            )}
          </div>

          {/* Carousel thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 group">
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  handleAddImage(
                    presetImages[Math.floor(Math.random() * presetImages.length)]
                  )
                }
                className="w-14 h-14 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-pink-500 flex flex-col items-center justify-center text-zinc-400 hover:text-pink-500 transition-colors"
                title="Add Carousel Image"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[9px] font-bold">Add</span>
              </button>
            )}
          </div>

          {/* Preset image picker */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Sample High-Res Photos
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {presetImages.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImages([p])}
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition-transform"
                >
                  <img src={p} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Filter Selection Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Photo Filter
            </span>
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedFilter === f.id
                      ? 'border-pink-500 bg-pink-500/10 text-pink-500 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Caption, AI Assistant, Meta & Details */}
        <div className="md:col-span-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            {/* AI Caption Generator Trigger */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Caption Writer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="text-xs font-bold text-purple-500 hover:underline"
                >
                  {showAIAssistant ? 'Hide' : 'Open'}
                </button>
              </div>

              {showAIAssistant && (
                <div className="flex flex-col gap-2.5 pt-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Describe what's in the photo or your mood..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 focus:outline-none focus:border-purple-500 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {(['aesthetic', 'engaging', 'funny', 'professional', 'hyped'] as const).map(
                      (tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setAiTone(tone)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                            aiTone === tone
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20'
                          }`}
                        >
                          {tone}
                        </button>
                      )
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="gradient"
                    isLoading={isGeneratingAI}
                    onClick={handleGenerateCaption}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Generate with Gemini
                  </Button>
                </div>
              )}
            </div>

            {/* Caption Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="Write a caption, mention @friends or add #hashtags..."
                className="w-full p-3 text-sm rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            {/* Hashtag Manager */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Hashtags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-500 border border-pink-500/20"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="hover:text-pink-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick tags */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                {['TokyoVibes', 'DigitalArt', 'SunsetMagic', 'Streetwear', 'GoodVibes'].map(
                  (qt) => (
                    <button
                      key={qt}
                      type="button"
                      onClick={() => handleAddHashtag(qt)}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-colors"
                    >
                      +{qt}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Location & Music */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-pink-500" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Music className="w-3 h-3 text-purple-500" />
                  Soundtrack
                </label>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="e.g. Midnight City"
                  className="px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Audience and Comment toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Audience:</span>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="followers">Followers Only</option>
                  <option value="close_friends">Close Friends</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Allow Comments</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="ghost" onClick={onClose}>
              Discard
            </Button>
            <Button variant="gradient" onClick={handleSubmit}>
              Share Post
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
