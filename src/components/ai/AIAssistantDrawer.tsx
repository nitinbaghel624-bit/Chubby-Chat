import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Send,
  MessageSquare,
  ShieldCheck,
  Languages,
  PenTool,
} from 'lucide-react';
import { Button } from '../common/Button';
import { AIService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  const [activeTool, setActiveTool] = useState<'caption' | 'bio' | 'moderate' | 'translate'>('caption');
  const [inputText, setInputText] = useState('');
  const [tone, setTone] = useState<'aesthetic' | 'engaging' | 'funny' | 'professional' | 'hyped'>('aesthetic');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunAI = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setOutput(null);

    try {
      if (activeTool === 'caption') {
        const res = await AIService.generateCaption({ topic: inputText, tone });
        const text = `${res.caption}\n\n${res.suggestedHashtags.join(' ')}`;
        setOutput(text);
      } else if (activeTool === 'bio') {
        const res = await AIService.suggestBio(inputText);
        setOutput(res);
      } else if (activeTool === 'moderate') {
        const res = await AIService.moderateContent(inputText);
        setOutput(
          `Safety Status: ${res.flagged ? '⚠️ Flagged' : '✅ Approved'}\nReason: ${
            res.reason || 'Content adheres to community guidelines.'
          }`
        );
      } else if (activeTool === 'translate') {
        const res = await AIService.translateMessage(inputText, targetLang);
        setOutput(res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard?.writeText?.(output);
    setCopied(true);
    showToast('Copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col z-10 border-l border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  Gemini AI Studio Assistant
                </h3>
                <span className="text-[10px] text-zinc-400">Powered by server-side Gemini</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tool Navigation */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-4 gap-1">
            <button
              onClick={() => {
                setActiveTool('caption');
                setOutput(null);
              }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                activeTool === 'caption'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Captions</span>
            </button>

            <button
              onClick={() => {
                setActiveTool('bio');
                setOutput(null);
              }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                activeTool === 'bio'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bio Writer</span>
            </button>

            <button
              onClick={() => {
                setActiveTool('translate');
                setOutput(null);
              }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                activeTool === 'translate'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>Translate</span>
            </button>

            <button
              onClick={() => {
                setActiveTool('moderate');
                setOutput(null);
              }}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                activeTool === 'moderate'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Safety</span>
            </button>
          </div>

          {/* Form & Input Section */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {activeTool === 'caption' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Post Topic / Concept
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Sunset coffee on a rooftop in Tokyo with friends..."
                  rows={3}
                  className="p-3 text-xs rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />

                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Tone
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['aesthetic', 'engaging', 'funny', 'professional', 'hyped'] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                          tone === t
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTool === 'bio' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  About Yourself / Interests
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Photographer based in SF, loves synthwave music and matcha..."
                  rows={3}
                  className="p-3 text-xs rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            )}

            {activeTool === 'translate' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Message to Translate
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message text..."
                  rows={3}
                  className="p-3 text-xs rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />

                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Target Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                >
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Korean">Korean (한국어)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                </select>
              </div>
            )}

            {activeTool === 'moderate' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Content to Check for Safety
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste comment or text to check against safety guidelines..."
                  rows={3}
                  className="p-3 text-xs rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            )}

            <Button
              variant="gradient"
              isLoading={isLoading}
              onClick={handleRunAI}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate with Gemini
            </Button>

            {/* Output Display Card */}
            {output && (
              <div className="p-4 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    AI Output Result
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {output}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
