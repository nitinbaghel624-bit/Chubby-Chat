import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, Message, MessageAttachment, User } from '../types';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { sounds } from '../utils/audio';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadTotal: number;
  selectConversation: (conv: Conversation | null) => void;
  sendMessage: (text: string, attachments?: MessageAttachment[], replyTo?: any) => void;
  addReaction: (messageId: string, emoji: string) => void;
  startDirectChat: (targetUser: User) => Conversation;
  createGroupChat: (name: string, memberIds: string[], avatar?: string, description?: string) => Conversation;
  acceptRequest: (conversationId: string) => void;
  deleteMessage: (messageId: string) => void;
  typingMap: Record<string, string[]>; // conversationId -> usernames
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>(() => StorageService.getConversations());
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});

  const refreshConversations = useCallback(() => {
    const list = StorageService.getConversations();
    setConversations(list);
  }, []);

  useEffect(() => {
    const unsubMsgSent = StorageService.on('message_sent', ({ conversationId }) => {
      refreshConversations();
      if (activeConversation && activeConversation.id === conversationId) {
        setMessages(StorageService.getMessages(conversationId));
      }
    });

    const unsubReaction = StorageService.on('message_reaction', ({ conversationId }) => {
      if (activeConversation && activeConversation.id === conversationId) {
        setMessages(StorageService.getMessages(conversationId));
      }
    });

    const unsubConvCreated = StorageService.on('conversation_created', () => {
      refreshConversations();
    });

    const unsubReset = StorageService.on('data_reset', () => {
      refreshConversations();
      setActiveConversation(null);
      setMessages([]);
    });

    return () => {
      unsubMsgSent();
      unsubReaction();
      unsubConvCreated();
      unsubReset();
    };
  }, [activeConversation, refreshConversations]);

  const selectConversation = (conv: Conversation | null) => {
    setActiveConversation(conv);
    if (conv) {
      const msgs = StorageService.getMessages(conv.id);
      setMessages(msgs);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = (text: string, attachments?: MessageAttachment[], replyTo?: any) => {
    if (!currentUser || !activeConversation) return;
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      attachments,
      replyTo,
      status: 'delivered',
      createdAt: new Date().toISOString(),
    };

    StorageService.sendMessage(activeConversation.id, newMsg);
    sounds.playMessageSent();

    // Auto-respond simulation in direct messages if chatting with an AI/bot or demo friend
    if (activeConversation.type === 'direct') {
      const otherMember = activeConversation.members.find((m) => m.userId !== currentUser.id);
      if (otherMember) {
        // Trigger realistic simulated typing & response after a short realistic delay
        setTimeout(() => {
          setTypingMap((prev) => ({
            ...prev,
            [activeConversation.id]: [otherMember.displayName],
          }));

          setTimeout(() => {
            setTypingMap((prev) => ({
              ...prev,
              [activeConversation.id]: [],
            }));

            const responses = [
              `That's awesome! Let's definitely collaborate on this ✨`,
              `Love that idea! I will review the preview and get back to you! 👍`,
              `Thanks for sharing! Looks super polished! 🚀`,
              `Got it! Talk to you in a bit ☕️`,
              `Amazing vibe! 🙌`,
            ];
            const botReply: Message = {
              id: `msg-reply-${Date.now()}`,
              conversationId: activeConversation.id,
              senderId: otherMember.userId,
              senderName: otherMember.displayName,
              senderAvatar: otherMember.avatar,
              text: responses[Math.floor(Math.random() * responses.length)],
              status: 'delivered',
              createdAt: new Date().toISOString(),
            };

            StorageService.sendMessage(activeConversation.id, botReply);
            sounds.playMessageReceived();
          }, 2400);
        }, 1200);
      }
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !activeConversation) return;
    sounds.playLikePop();
    StorageService.addMessageReaction(activeConversation.id, messageId, {
      emoji,
      userId: currentUser.id,
      username: currentUser.username,
    });
  };

  const startDirectChat = (targetUser: User): Conversation => {
    if (!currentUser) throw new Error('Must be logged in');

    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.memberIds.includes(targetUser.id) && c.memberIds.includes(currentUser.id)
    );

    if (existing) {
      selectConversation(existing);
      return existing;
    }

    const newConv: Conversation = {
      id: `conv-dm-${Date.now()}`,
      type: 'direct',
      members: [
        {
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          role: 'member',
        },
        {
          userId: targetUser.id,
          username: targetUser.username,
          displayName: targetUser.displayName,
          avatar: targetUser.avatar,
          role: 'member',
        },
      ],
      memberIds: [currentUser.id, targetUser.id],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.createConversation(newConv);
    selectConversation(newConv);
    return newConv;
  };

  const createGroupChat = (
    name: string,
    memberIds: string[],
    avatar?: string,
    description?: string
  ): Conversation => {
    if (!currentUser) throw new Error('Must be logged in');

    const allMemberIds = Array.from(new Set([currentUser.id, ...memberIds]));
    const members = allMemberIds.map((id) => {
      const user = allUsers.find((u) => u.id === id) || (id === currentUser.id ? currentUser : null);
      return {
        userId: id,
        username: user?.username || 'user',
        displayName: user?.displayName || 'User',
        avatar:
          user?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: id === currentUser.id ? ('owner' as const) : ('member' as const),
      };
    });

    const newGroup: Conversation = {
      id: `conv-group-${Date.now()}`,
      type: 'group',
      name: name || 'New Group Chat',
      avatar: avatar || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      description,
      members,
      memberIds: allMemberIds,
      adminIds: [currentUser.id],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.createConversation(newGroup);
    selectConversation(newGroup);
    showToast(`Created group "${name}" 🎉`);
    return newGroup;
  };

  const acceptRequest = (conversationId: string) => {
    const list = StorageService.getConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (conv) {
      conv.isRequest = false;
      localStorage.setItem('chubby_conversations', JSON.stringify(list));
      refreshConversations();
      showToast('Message request accepted!');
    }
  };

  const deleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    const list = messages.filter((m) => m.id !== messageId);
    setMessages(list);
    const all = StorageService.getMessages(activeConversation.id);
    const updated = all.filter((m) => m.id !== messageId);
    const allMsgsMap = JSON.parse(localStorage.getItem('chubby_messages') || '{}');
    allMsgsMap[activeConversation.id] = updated;
    localStorage.setItem('chubby_messages', JSON.stringify(allMsgsMap));
    showToast('Message deleted.');
  };

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        unreadTotal,
        selectConversation,
        sendMessage,
        addReaction,
        startDirectChat,
        createGroupChat,
        acceptRequest,
        deleteMessage,
        typingMap,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
