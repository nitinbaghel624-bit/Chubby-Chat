export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  isPrivate: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  status?: UserStatus;
  lastSeen?: string;
  interests?: string[];
  createdAt: string;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  filter?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified?: boolean;
  };
  media: PostMedia[];
  caption: string;
  hashtags: string[];
  location?: string;
  music?: {
    title: string;
    artist: string;
  };
  taggedUsers?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  audience: 'public' | 'followers' | 'close_friends';
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  likesCount: number;
  isLiked?: boolean;
  parentId?: string; // for nested replies
  replyToUsername?: string;
  replyCount?: number;
  createdAt: string;
}

export interface StoryItem {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    userVotedIndex?: number;
  };
  questionPrompt?: {
    prompt: string;
    responses: { userId: string; username: string; answer: string }[];
  };
  music?: string;
  stickers?: string[];
  viewersCount: number;
  viewers?: { id: string; username: string; avatar: string; viewedAt: string }[];
  createdAt: string;
  expiresAt: string;
}

export interface UserStories {
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified?: boolean;
  };
  hasUnseen: boolean;
  items: StoryItem[];
}

export interface Reel {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified?: boolean;
  };
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  music?: {
    title: string;
    artist: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  username: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name?: string;
  size?: number;
  duration?: number; // for audio/video in seconds
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  };
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  isDeleted?: boolean;
  sharedPost?: Post;
  createdAt: string;
}

export interface ConversationMember {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  role: 'member' | 'admin' | 'owner';
  lastReadTimestamp?: string;
  isMuted?: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  description?: string;
  members: ConversationMember[];
  memberIds: string[];
  adminIds?: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isRequest?: boolean; // message requests from unknown users
  typingUsers?: string[]; // user IDs currently typing
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'like_post'
  | 'like_reel'
  | 'comment_post'
  | 'reply_comment'
  | 'story_reply'
  | 'follow'
  | 'follow_request'
  | 'follow_accept'
  | 'mention'
  | 'story_like'
  | 'message'
  | 'call';


export type NotificationItem = {
  id: string;
  recipientId: string;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  type: NotificationType;
  title: string;
  body?: string;
  targetId?: string; // postId, commentId, conversationId
  targetPreview?: string; // thumbnail image or comment snippet
  isRead: boolean;
  createdAt: string;
};

export type Notification = NotificationItem & {
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  text?: string;
  mediaUrl?: string;
};


export interface SavedCollection {
  id: string;
  userId: string;
  name: string;
  coverUrl?: string;
  postIds: string[];
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'user' | 'post' | 'comment' | 'message';
  targetId: string;
  targetContent?: string;
  category: 'spam' | 'harassment' | 'hate' | 'nudity' | 'violence' | 'scam' | 'impersonation' | 'other';
  reason: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  aiRiskScore?: number;
  aiFlags?: string[];
  createdAt: string;
}

export interface ActiveCall {
  id: string;
  conversationId: string;
  caller: User;
  recipient: User;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  startedAt?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
}

export type NearbyRadius = 0.5 | 1 | 5 | 10 | 25;

export interface NearbySettings {
  isEnabled: boolean; // OFF by default
  showApproximateDistance: boolean; // default true
  allowNearbyMessages: boolean; // default true
  onlyShowPeopleIFollow: boolean; // default false
  radiusKm: NearbyRadius; // default 5
}

export interface UserPresence {
  userId: string;
  geohash?: string;
  approximateLocation?: {
    city?: string;
    neighborhood?: string;
    fuzzyLat?: number;
    fuzzyLng?: number;
  };
  locationUpdatedAt: string;
  expiresAt: string;
  isNearbyDiscoveryEnabled: boolean;
  activityStatus: 'online' | 'active_recently' | 'offline';
  lastActiveAt: string;
}

export interface NearbyUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified?: boolean;
  isPrivate: boolean;
  bio?: string;
  status: 'online' | 'active_recently';
  activeText: string; // e.g. "Active now", "Active 3m ago"
  approximateDistance: string; // e.g. "Less than 500 m", "~800 m away", "~1.5 km away", "~3 km away", "5+ km away"
  distanceKm: number;
  interests: string[];
  mutualInterests?: string[];
  mutualFriendsCount?: number;
  mutualFriends?: { username: string; avatar: string }[];
  isFollowing?: boolean;
  isFollowPending?: boolean;
  allowMessage: boolean;
}

export interface UserSettings {
  isPrivate: boolean;
  showActivityStatus: boolean;
  sendReadReceipts: boolean;
  allowStorySharing: boolean;
  allowCommentsFrom: 'everyone' | 'following' | 'nobody';
  allowMentionsFrom: 'everyone' | 'following' | 'nobody';
  allowMessagesFrom: 'everyone' | 'following';
  theme: 'light' | 'dark' | 'system';
  twoFactorEnabled: boolean;
  nearbySettings?: NearbySettings;
  pushNotifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
    calls: boolean;
    stories: boolean;
  };
}

export interface AdminAnalytics {
  totalUsers: number;
  activeToday: number;
  newUsersThisWeek: number;
  totalPosts: number;
  totalMessages: number;
  totalReels: number;
  pendingReports: number;
  suspendedUsers: number;
}
