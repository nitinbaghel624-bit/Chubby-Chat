import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  Phone,
  Video,
  Info,
  Pin,
  ChevronLeft,
  Trash2,
  BellOff,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { CreateGroupModal } from './CreateGroupModal';
import { ChatSearchModal } from './ChatSearchModal';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { Message, Conversation, User } from '../../types';

interface ChatLayoutProps {
  onSelectUser: (userId: string) => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ onSelectUser }) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    messages,
    typingMap,
    deleteMessage,
  } = useChat();

  const { currentUser, allUsers } = useAuth();
  const { startCall } = useCall();

  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'group' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typingNow = activeConversation ? typingMap[activeConversation.id] || [] : [];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingNow.length]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterTab === 'direct' && c.type !== 'direct') return false;
    if (filterTab === 'group' && c.type !== 'group') return false;
    if (filterTab === 'unread' && (c.unreadCount || 0) === 0) return false;

    if (searchQuery.trim()) {
      const matchName = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLastMsg = c.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchName || matchLastMsg;
    }
    return true;
  });

  const getChatPartner = (conv: Conversation) => {
    if (conv.type === 'group') return null;
    return conv.members.find((m) => m.userId !== currentUser?.id) || conv.members[0];
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    if (!activeConversation) return;
    const partner = getChatPartner(activeConversation);
    if (partner) {
      const fullUser = allUsers.find((u) => u.id === partner.userId) || {
        id: partner.userId,
        username: partner.username,
        displayName: partner.displayName,
        avatar: partner.avatar,
        email: '',
        isPrivate: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: new Date().toISOString(),
      };
      startCall(fullUser, type);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[86vh] my-2 md:my-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
            Messages
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Create Group Chat"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 flex flex-col gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(['all', 'direct', 'group', 'unread'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterTab === tab
                    ? 'bg-pink-500 text-white'
                    : 'bg-zinc-200/50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40 p-2">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-zinc-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              const partner = getChatPartner(conv);
              const displayName = conv.type === 'group' ? conv.name : partner?.displayName;
              const avatar = conv.type === 'group' ? conv.avatar : partner?.avatar;
              const isPinned = conv.isPinned;

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-pink-500/10 dark:bg-pink-500/15 border border-pink-500/20'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <Avatar src={avatar} size="md" />
                      {conv.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-purple-600 rounded-full text-white">
                          <Users className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                          {displayName}
                        </span>
                        {isPinned && <Pin className="w-3 h-3 text-pink-500 fill-pink-500" />}
                      </div>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">
                        {conv.lastMessage?.text || 'Sent an attachment'}
                      </p>
                    </div>
                  </div>

                  {/* Time & Unread Badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-[10px] text-zinc-400">
                      {conv.lastMessage &&
                        new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </span>
                    {(conv.unreadCount || 0) > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Workspace */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative">
          {/* Active Chat Header */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {/* Mobile Back button */}
              <button
                onClick={() => selectConversation(null)}
                className="md:hidden p-1.5 -ml-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Chat Info */}
              <div
                onClick={() => {
                  const partner = getChatPartner(activeConversation);
                  if (partner) onSelectUser(partner.userId);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Avatar
                  src={
                    activeConversation.type === 'group'
                      ? activeConversation.avatar
                      : getChatPartner(activeConversation)?.avatar
                  }
                  size="sm"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors">
                    <span>
                      {activeConversation.type === 'group'
                        ? activeConversation.name
                        : getChatPartner(activeConversation)?.displayName}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {activeConversation.type === 'group'
                      ? `${activeConversation.members.length} members`
                      : 'Active now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Controls: Call, Video, Search, Info */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStartCall('voice')}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStartCall('video')}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Search Messages"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                className={`p-2 rounded-xl transition-colors ${
                  showInfoSidebar
                    ? 'bg-pink-500/10 text-pink-500'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 bg-zinc-50/30 dark:bg-zinc-950/20">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
                onReply={(m) => setReplyingToMessage(m)}
              />
            ))}

            {/* Typing Indicator */}
            {typingNow.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 py-1.5 px-3 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
                <span>{typingNow.join(', ')} typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <MessageComposer
            replyingTo={replyingToMessage}
            onCancelReply={() => setReplyingToMessage(null)}
          />

          {/* Info & Members Sidebar Drawer */}
          {showInfoSidebar && (
            <div className="absolute top-14 right-0 bottom-0 w-72 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-4 shadow-2xl z-20 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Chat Info
                </span>
                <button
                  onClick={() => setShowInfoSidebar(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Close
                </button>
              </div>

              {/* Group Members List */}
              {activeConversation.type === 'group' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-500">
                    Members ({activeConversation.members.length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {activeConversation.members.map((m) => (
                      <div
                        key={m.userId}
                        onClick={() => onSelectUser(m.userId)}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Avatar src={m.avatar} size="xs" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {m.displayName}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate">@{m.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center text-zinc-400 bg-white dark:bg-zinc-900">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-1">
            Your Messages
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mb-4">
            Send private messages, share photos and voice notes, or create groups with your friends.
          </p>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            Create Group Chat
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />

      <ChatSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        messages={messages}
        onSelectMessage={(msg) => {}}
      />
    </div>
  );
};
