import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Search, MessageSquare, Image, FileText } from 'lucide-react';
import { Message } from '../../types';

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSelectMessage: (msg: Message) => void;
}

export const ChatSearchModal: React.FC<ChatSearchModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSelectMessage,
}) => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'text' | 'media' | 'files'>('text');

  const filteredMessages = messages.filter((m) => {
    if (tab === 'media') {
      return m.attachments?.some((a) => a.type === 'image' || a.type === 'video');
    }
    if (tab === 'files') {
      return m.attachments?.some((a) => a.type === 'file' || a.type === 'audio');
    }
    return m.text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search in Conversation" maxWidth="md">
      <div className="flex flex-col gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, links, keywords..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 border border-zinc-200 dark:border-zinc-700"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setTab('text')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              tab === 'text'
                ? 'bg-pink-500/10 text-pink-500 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => setTab('media')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              tab === 'media'
                ? 'bg-pink-500/10 text-pink-500 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Photos & Videos</span>
          </button>
          <button
            onClick={() => setTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              tab === 'files'
                ? 'bg-pink-500/10 text-pink-500 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audio & Files</span>
          </button>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredMessages.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  onSelectMessage(msg);
                  onClose();
                }}
                className="p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {msg.senderName}
                  </span>
                  <span className="text-zinc-400">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                  {msg.text || '[Attachment]'}
                </p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-purple-400 font-medium">
                    <Image className="w-3 h-3" />
                    <span>{msg.attachments.length} Attachment(s)</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
