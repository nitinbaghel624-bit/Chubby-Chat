import {
  User,
  Post,
  Reel,
  UserStories,
  Conversation,
  Message,
  NotificationItem,
  SavedCollection,
  ReportItem,
  UserSettings,
  NearbySettings,
  UserPresence,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_REELS,
  INITIAL_STORIES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SAVED_COLLECTIONS,
  INITIAL_REPORTS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'chubby_users',
  CURRENT_USER_ID: 'chubby_current_user_id',
  POSTS: 'chubby_posts',
  REELS: 'chubby_reels',
  STORIES: 'chubby_stories',
  CONVERSATIONS: 'chubby_conversations',
  MESSAGES: 'chubby_messages',
  NOTIFICATIONS: 'chubby_notifications',
  SAVED_COLLECTIONS: 'chubby_saved_collections',
  FOLLOWS: 'chubby_follows', // record of { [userId]: string[] followingIds }
  FOLLOW_REQUESTS: 'chubby_follow_requests', // { [userId]: string[] pendingUserIds }
  BLOCKS: 'chubby_blocked_users', // string[] userIds blocked by current user
  MUTES: 'chubby_muted_users',
  SETTINGS: 'chubby_settings',
  NEARBY_SETTINGS: 'chubby_nearby_settings',
  USER_PRESENCE: 'chubby_user_presence',
  REPORTS: 'chubby_reports',
};

// Safe JSON parser
function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export class StorageService {
  private static listeners: Map<string, Set<(data: any) => void>> = new Map();

  static on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  static emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }

  // Initialization & Reset
  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-chubby-admin');
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      setStorageItem(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REELS)) {
      setStorageItem(STORAGE_KEYS.REELS, INITIAL_REELS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
      setStorageItem(STORAGE_KEYS.STORIES, INITIAL_STORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      setStorageItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_COLLECTIONS)) {
      setStorageItem(STORAGE_KEYS.SAVED_COLLECTIONS, INITIAL_SAVED_COLLECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      setStorageItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOWS)) {
      const initialFollows: Record<string, string[]> = {
        'user-chubby-admin': ['user-elena', 'user-marcus', 'user-leo', 'user-sophia'],
        'user-elena': ['user-chubby-admin', 'user-marcus', 'user-zara'],
        'user-marcus': ['user-chubby-admin', 'user-elena', 'user-leo'],
      };
      setStorageItem(STORAGE_KEYS.FOLLOWS, initialFollows);
    }
  }

  static resetToDemoData() {
    setStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-chubby-admin');
    setStorageItem(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    setStorageItem(STORAGE_KEYS.REELS, INITIAL_REELS);
    setStorageItem(STORAGE_KEYS.STORIES, INITIAL_STORIES);
    setStorageItem(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    setStorageItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStorageItem(STORAGE_KEYS.SAVED_COLLECTIONS, INITIAL_SAVED_COLLECTIONS);
    setStorageItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    setStorageItem(STORAGE_KEYS.BLOCKS, []);
    setStorageItem(STORAGE_KEYS.MUTES, []);
    this.emit('data_reset');
  }

  static resetToDefaults() {
    this.resetToDemoData();
  }

  static exportAllData(): string {
    const data = {
      users: this.getUsers(),
      posts: this.getPosts(),
      reels: this.getReels(),
      stories: this.getStories(),
      conversations: this.getConversations(),
      reports: this.getReports(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static saveNotifications(userId: string, notifs: any[]) {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    this.emit('notifications_read', userId);
  }


  // Users
  static getUsers(): User[] {
    return getStorageItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByUsername(username: string): User | undefined {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  static getCurrentUser(): User {
    const currentId = getStorageItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-chubby-admin');
    const user = this.getUserById(currentId);
    if (user) return user;
    const users = this.getUsers();
    return users[0] || INITIAL_USERS[0];
  }

  static setCurrentUserId(id: string) {
    setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    this.emit('auth_changed', id);
  }

  static updateUser(updatedUser: User) {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setStorageItem(STORAGE_KEYS.USERS, users);
    this.emit('user_updated', updatedUser);
  }

  static addUser(newUser: User) {
    const users = [...this.getUsers(), newUser];
    setStorageItem(STORAGE_KEYS.USERS, users);
    this.emit('user_added', newUser);
  }

  // Follows
  static getFollowing(userId: string): string[] {
    const follows = getStorageItem<Record<string, string[]>>(STORAGE_KEYS.FOLLOWS, {});
    return follows[userId] || [];
  }

  static isFollowing(currentUserId: string, targetUserId: string): boolean {
    const following = this.getFollowing(currentUserId);
    return following.includes(targetUserId);
  }

  static toggleFollow(currentUserId: string, targetUserId: string): { isFollowing: boolean; isRequested: boolean } {
    const targetUser = this.getUserById(targetUserId);
    const currentUser = this.getUserById(currentUserId);
    if (!targetUser || !currentUser) return { isFollowing: false, isRequested: false };

    const follows = getStorageItem<Record<string, string[]>>(STORAGE_KEYS.FOLLOWS, {});
    const requests = getStorageItem<Record<string, string[]>>(STORAGE_KEYS.FOLLOW_REQUESTS, {});

    const currentFollowing = follows[currentUserId] || [];
    const isAlreadyFollowing = currentFollowing.includes(targetUserId);

    if (isAlreadyFollowing) {
      // Unfollow
      follows[currentUserId] = currentFollowing.filter((id) => id !== targetUserId);
      setStorageItem(STORAGE_KEYS.FOLLOWS, follows);

      this.updateUser({ ...currentUser, followingCount: Math.max(0, currentUser.followingCount - 1) });
      this.updateUser({ ...targetUser, followersCount: Math.max(0, targetUser.followersCount - 1) });

      this.emit('follow_changed', { currentUserId, targetUserId, isFollowing: false });
      return { isFollowing: false, isRequested: false };
    } else {
      if (targetUser.isPrivate) {
        // Create follow request
        const currentReqs = requests[targetUserId] || [];
        if (!currentReqs.includes(currentUserId)) {
          requests[targetUserId] = [...currentReqs, currentUserId];
          setStorageItem(STORAGE_KEYS.FOLLOW_REQUESTS, requests);

          this.addNotification({
            id: `notif-req-${Date.now()}`,
            recipientId: targetUserId,
            actor: {
              id: currentUser.id,
              username: currentUser.username,
              displayName: currentUser.displayName,
              avatar: currentUser.avatar,
            },
            type: 'follow_request',
            title: `${currentUser.displayName} requested to follow you.`,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        return { isFollowing: false, isRequested: true };
      } else {
        // Direct follow
        follows[currentUserId] = [...currentFollowing, targetUserId];
        setStorageItem(STORAGE_KEYS.FOLLOWS, follows);

        this.updateUser({ ...currentUser, followingCount: currentUser.followingCount + 1 });
        this.updateUser({ ...targetUser, followersCount: targetUser.followersCount + 1 });

        this.addNotification({
          id: `notif-fol-${Date.now()}`,
          recipientId: targetUserId,
          actor: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatar: currentUser.avatar,
          },
          type: 'follow',
          title: `${currentUser.displayName} started following you.`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        this.emit('follow_changed', { currentUserId, targetUserId, isFollowing: true });
        return { isFollowing: true, isRequested: false };
      }
    }
  }

  static hasRequestedFollow(currentUserId: string, targetUserId: string): boolean {
    const requests = getStorageItem<Record<string, string[]>>(STORAGE_KEYS.FOLLOW_REQUESTS, {});
    const targetReqs = requests[targetUserId] || [];
    return targetReqs.includes(currentUserId);
  }

  // Posts
  static getPosts(): Post[] {
    const posts = getStorageItem<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const blocked = this.getBlockedUsers();
    return posts.filter((p) => !blocked.includes(p.authorId));
  }

  static getPostById(id: string): Post | undefined {
    return this.getPosts().find((p) => p.id === id);
  }

  static addPost(post: Post) {
    const posts = [post, ...this.getPosts()];
    setStorageItem(STORAGE_KEYS.POSTS, posts);

    const user = this.getUserById(post.authorId);
    if (user) {
      this.updateUser({ ...user, postsCount: user.postsCount + 1 });
    }

    this.emit('post_created', post);
  }

  static updatePost(post: Post) {
    const posts = this.getPosts().map((p) => (p.id === post.id ? post : p));
    setStorageItem(STORAGE_KEYS.POSTS, posts);
    this.emit('post_updated', post);
  }

  static deletePost(postId: string) {
    const post = this.getPostById(postId);
    const posts = this.getPosts().filter((p) => p.id !== postId);
    setStorageItem(STORAGE_KEYS.POSTS, posts);

    if (post) {
      const user = this.getUserById(post.authorId);
      if (user) {
        this.updateUser({ ...user, postsCount: Math.max(0, user.postsCount - 1) });
      }
    }

    this.emit('post_deleted', postId);
  }

  static toggleLikePost(postId: string, userId: string): Post | undefined {
    const post = this.getPostById(postId);
    if (!post) return undefined;

    const isLiked = !post.isLiked;
    const likesCount = isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
    const updated = { ...post, isLiked, likesCount };
    this.updatePost(updated);

    if (isLiked && post.authorId !== userId) {
      const user = this.getUserById(userId);
      if (user) {
        this.addNotification({
          id: `notif-like-${Date.now()}`,
          recipientId: post.authorId,
          actor: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          type: 'like_post',
          title: `${user.displayName} liked your post.`,
          targetId: post.id,
          targetPreview: post.media[0]?.url,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return updated;
  }

  static toggleSavePost(postId: string, userId: string): Post | undefined {
    const post = this.getPostById(postId);
    if (!post) return undefined;

    const isSaved = !post.isSaved;
    const updated = { ...post, isSaved };
    this.updatePost(updated);

    // Update 'All Posts' collection
    const collections = this.getSavedCollections(userId);
    const allCol = collections.find((c) => c.id === 'col-all') || {
      id: 'col-all',
      userId,
      name: 'All Posts',
      postIds: [],
      createdAt: new Date().toISOString(),
    };

    if (isSaved) {
      allCol.postIds = Array.from(new Set([...allCol.postIds, postId]));
      if (!allCol.coverUrl && post.media[0]?.url) {
        allCol.coverUrl = post.media[0].url;
      }
    } else {
      allCol.postIds = allCol.postIds.filter((id) => id !== postId);
    }

    this.saveCollection(allCol);
    return updated;
  }

  // Reels
  static getReels(): Reel[] {
    const reels = getStorageItem<Reel[]>(STORAGE_KEYS.REELS, INITIAL_REELS);
    const blocked = this.getBlockedUsers();
    return reels.filter((r) => !blocked.includes(r.authorId));
  }

  static toggleLikeReel(reelId: string, userId: string): Reel | undefined {
    const reels = this.getReels();
    const reel = reels.find((r) => r.id === reelId);
    if (!reel) return undefined;

    const isLiked = !reel.isLiked;
    const likesCount = isLiked ? reel.likesCount + 1 : Math.max(0, reel.likesCount - 1);
    const updated = { ...reel, isLiked, likesCount };

    const newReels = reels.map((r) => (r.id === reelId ? updated : r));
    setStorageItem(STORAGE_KEYS.REELS, newReels);
    this.emit('reel_updated', updated);
    return updated;
  }

  static addReel(reel: Reel) {
    const reels = [reel, ...this.getReels()];
    setStorageItem(STORAGE_KEYS.REELS, reels);
    this.emit('reel_created', reel);
  }

  // Stories
  static getStories(): UserStories[] {
    const stories = getStorageItem<UserStories[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
    const blocked = this.getBlockedUsers();
    return stories.filter((s) => !blocked.includes(s.userId));
  }

  static addStory(userId: string, storyItem: any) {
    const user = this.getUserById(userId);
    if (!user) return;

    const allStories = this.getStories();
    const existingIndex = allStories.findIndex((s) => s.userId === userId);

    if (existingIndex >= 0) {
      allStories[existingIndex].items.push(storyItem);
      allStories[existingIndex].hasUnseen = true;
    } else {
      allStories.unshift({
        userId,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
        hasUnseen: true,
        items: [storyItem],
      });
    }

    setStorageItem(STORAGE_KEYS.STORIES, allStories);
    this.emit('story_added', { userId, storyItem });
  }

  // Messages & Conversations
  static getConversations(): Conversation[] {
    const convs = getStorageItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    const blocked = this.getBlockedUsers();
    return convs.filter((c) => !c.memberIds.some((m) => blocked.includes(m)));
  }

  static getConversationById(id: string): Conversation | undefined {
    return this.getConversations().find((c) => c.id === id);
  }

  static getMessages(conversationId: string): Message[] {
    const allMessages = getStorageItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return allMessages[conversationId] || [];
  }

  static sendMessage(conversationId: string, message: Message) {
    const allMessages = getStorageItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const list = allMessages[conversationId] || [];
    allMessages[conversationId] = [...list, message];
    setStorageItem(STORAGE_KEYS.MESSAGES, allMessages);

    // Update conversation lastMessage
    const convs = this.getConversations();
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = {
        text: message.text || (message.attachments?.length ? '[Attachment]' : ''),
        senderId: message.senderId,
        senderName: message.senderName,
        createdAt: message.createdAt,
      };
      conv.updatedAt = message.createdAt;
      setStorageItem(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    this.emit('message_sent', { conversationId, message });
  }

  static addMessageReaction(conversationId: string, messageId: string, reaction: { emoji: string; userId: string; username: string }) {
    const allMessages = getStorageItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const list = allMessages[conversationId] || [];
    const msg = list.find((m) => m.id === messageId);
    if (!msg) return;

    const reactions = msg.reactions || [];
    const existingIndex = reactions.findIndex((r) => r.userId === reaction.userId);
    if (existingIndex >= 0) {
      if (reactions[existingIndex].emoji === reaction.emoji) {
        reactions.splice(existingIndex, 1);
      } else {
        reactions[existingIndex] = reaction;
      }
    } else {
      reactions.push(reaction);
    }

    msg.reactions = reactions;
    setStorageItem(STORAGE_KEYS.MESSAGES, allMessages);
    this.emit('message_reaction', { conversationId, messageId, reaction });
  }

  static createConversation(conversation: Conversation) {
    const convs = [conversation, ...this.getConversations()];
    setStorageItem(STORAGE_KEYS.CONVERSATIONS, convs);
    this.emit('conversation_created', conversation);
  }

  // Notifications
  static getNotifications(userId: string): NotificationItem[] {
    const notifs = getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs.filter((n) => n.recipientId === userId);
  }

  static addNotification(notif: NotificationItem) {
    const notifs = [notif, ...getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)];
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    this.emit('new_notification', notif);
  }

  static markAllNotificationsRead(userId: string) {
    const notifs = getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.recipientId === userId ? { ...n, isRead: true } : n));
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.emit('notifications_read', userId);
  }

  // Collections
  static getSavedCollections(userId: string): SavedCollection[] {
    const collections = getStorageItem<SavedCollection[]>(STORAGE_KEYS.SAVED_COLLECTIONS, INITIAL_SAVED_COLLECTIONS);
    return collections.filter((c) => c.userId === userId);
  }

  static saveCollection(collection: SavedCollection) {
    const all = getStorageItem<SavedCollection[]>(STORAGE_KEYS.SAVED_COLLECTIONS, INITIAL_SAVED_COLLECTIONS);
    const existingIndex = all.findIndex((c) => c.id === collection.id);
    if (existingIndex >= 0) {
      all[existingIndex] = collection;
    } else {
      all.push(collection);
    }
    setStorageItem(STORAGE_KEYS.SAVED_COLLECTIONS, all);
    this.emit('collection_updated', collection);
  }

  static deleteCollection(id: string) {
    const all = getStorageItem<SavedCollection[]>(STORAGE_KEYS.SAVED_COLLECTIONS, INITIAL_SAVED_COLLECTIONS);
    const filtered = all.filter((c) => c.id !== id);
    setStorageItem(STORAGE_KEYS.SAVED_COLLECTIONS, filtered);
    this.emit('collection_deleted', id);
  }

  // Moderation & Safety
  static getReports(): ReportItem[] {
    return getStorageItem<ReportItem[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  static addReport(report: ReportItem) {
    const reports = [report, ...this.getReports()];
    setStorageItem(STORAGE_KEYS.REPORTS, reports);
    this.emit('report_added', report);
  }

  static updateReport(report: ReportItem) {
    const reports = this.getReports().map((r) => (r.id === report.id ? report : r));
    setStorageItem(STORAGE_KEYS.REPORTS, reports);
    this.emit('report_updated', report);
  }

  static getBlockedUsers(): string[] {
    return getStorageItem<string[]>(STORAGE_KEYS.BLOCKS, []);
  }

  static blockUser(userId: string) {
    const current = this.getBlockedUsers();
    if (!current.includes(userId)) {
      setStorageItem(STORAGE_KEYS.BLOCKS, [...current, userId]);
      this.emit('user_blocked', userId);
    }
  }

  static unblockUser(userId: string) {
    const current = this.getBlockedUsers();
    setStorageItem(STORAGE_KEYS.BLOCKS, current.filter((id) => id !== userId));
    this.emit('user_unblocked', userId);
  }

  static getMutedUsers(): string[] {
    return getStorageItem<string[]>(STORAGE_KEYS.MUTES, []);
  }

  static toggleMuteUser(userId: string): boolean {
    const current = this.getMutedUsers();
    let updated: string[];
    let isMuted: boolean;
    if (current.includes(userId)) {
      updated = current.filter((id) => id !== userId);
      isMuted = false;
    } else {
      updated = [...current, userId];
      isMuted = true;
    }
    setStorageItem(STORAGE_KEYS.MUTES, updated);
    this.emit('user_mute_toggled', { userId, isMuted });
    return isMuted;
  }

  // Settings
  static getSettings(): UserSettings {
    const defaultSettings: UserSettings = {
      isPrivate: false,
      showActivityStatus: true,
      sendReadReceipts: true,
      allowStorySharing: true,
      allowCommentsFrom: 'everyone',
      allowMentionsFrom: 'everyone',
      allowMessagesFrom: 'everyone',
      theme: 'system',
      twoFactorEnabled: false,
      pushNotifications: {
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        calls: true,
        stories: true,
      },
    };
    return getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  static saveSettings(settings: UserSettings) {
    setStorageItem(STORAGE_KEYS.SETTINGS, settings);
    this.emit('settings_updated', settings);
  }

  // People Nearby Settings & Presence
  static getNearbySettings(userId: string): NearbySettings {
    const all = getStorageItem<Record<string, NearbySettings>>(STORAGE_KEYS.NEARBY_SETTINGS, {});
    return (
      all[userId] || {
        isEnabled: false, // Default OFF
        showApproximateDistance: true,
        allowNearbyMessages: true,
        onlyShowPeopleIFollow: false,
        radiusKm: 5,
      }
    );
  }

  static saveNearbySettings(userId: string, settings: NearbySettings) {
    const all = getStorageItem<Record<string, NearbySettings>>(STORAGE_KEYS.NEARBY_SETTINGS, {});
    all[userId] = settings;
    setStorageItem(STORAGE_KEYS.NEARBY_SETTINGS, all);
    this.emit('nearby_settings_updated', { userId, settings });

    // If disabled, immediately clear presence
    if (!settings.isEnabled) {
      this.clearUserPresence(userId);
    }
  }

  static getUserPresence(userId: string): UserPresence | null {
    const presences = getStorageItem<Record<string, UserPresence>>(STORAGE_KEYS.USER_PRESENCE, {});
    const item = presences[userId];
    if (!item) return null;

    // Check expiration
    if (new Date(item.expiresAt).getTime() < Date.now()) {
      delete presences[userId];
      setStorageItem(STORAGE_KEYS.USER_PRESENCE, presences);
      return null;
    }
    return item;
  }

  static getAllUserPresences(): Record<string, UserPresence> {
    const presences = getStorageItem<Record<string, UserPresence>>(STORAGE_KEYS.USER_PRESENCE, {});
    const now = Date.now();
    const valid: Record<string, UserPresence> = {};
    let changed = false;

    Object.entries(presences).forEach(([uid, p]) => {
      if (new Date(p.expiresAt).getTime() >= now && p.isNearbyDiscoveryEnabled) {
        valid[uid] = p;
      } else {
        changed = true;
      }
    });

    if (changed) {
      setStorageItem(STORAGE_KEYS.USER_PRESENCE, valid);
    }
    return valid;
  }

  static updateUserPresence(presence: UserPresence) {
    const presences = getStorageItem<Record<string, UserPresence>>(STORAGE_KEYS.USER_PRESENCE, {});
    presences[presence.userId] = presence;
    setStorageItem(STORAGE_KEYS.USER_PRESENCE, presences);
    this.emit('presence_updated', presence);
  }

  static clearUserPresence(userId: string) {
    const presences = getStorageItem<Record<string, UserPresence>>(STORAGE_KEYS.USER_PRESENCE, {});
    if (presences[userId]) {
      delete presences[userId];
      setStorageItem(STORAGE_KEYS.USER_PRESENCE, presences);
      this.emit('presence_cleared', userId);
    }
  }
}
