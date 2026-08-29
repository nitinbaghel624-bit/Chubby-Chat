import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Reel, UserStories, Comment, StoryItem } from '../types';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { sounds } from '../utils/audio';

interface PostContextType {
  posts: Post[];
  reels: Reel[];
  stories: UserStories[];
  activeStoryViewerUser: UserStories | null;
  openStoryViewer: (stories: UserStories) => void;
  closeStoryViewer: () => void;
  createPost: (postData: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleLikeReel: (reelId: string) => void;
  createStory: (mediaUrl: string, mediaType: 'image' | 'video', caption?: string, poll?: any, questionPrompt?: any) => void;
  voteStoryPoll: (storyId: string, optionIndex: number) => void;
  respondStoryQuestion: (storyId: string, answer: string) => void;
  getComments: (postId: string) => Comment[];
  addComment: (postId: string, text: string, parentId?: string, replyToUsername?: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  reportContent: (targetType: 'post' | 'comment' | 'user' | 'message', targetId: string, category: any, reason: string, contentSnippet?: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>(() => StorageService.getPosts());
  const [reels, setReels] = useState<Reel[]>(() => StorageService.getReels());
  const [stories, setStories] = useState<UserStories[]>(() => StorageService.getStories());
  const [activeStoryViewerUser, setActiveStoryViewerUser] = useState<UserStories | null>(null);

  // In-memory comments map keyed by postId with local storage fallback
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('chubby_comments_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Seed initial comments
    return {
      'post-1': [
        {
          id: 'comm-1-1',
          postId: 'post-1',
          authorId: 'user-marcus',
          author: {
            id: 'user-marcus',
            username: 'marcus_beats',
            displayName: 'Marcus Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            isVerified: true,
          },
          text: 'The color gradient transitions seamlessly! Soft violet all day long 💜🔥',
          likesCount: 18,
          isLiked: true,
          createdAt: '2026-02-28T19:00:00Z',
        },
        {
          id: 'comm-1-2',
          postId: 'post-1',
          authorId: 'user-zara',
          author: {
            id: 'user-zara',
            username: 'zara_styles',
            displayName: 'Zara Khan',
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
            isVerified: true,
          },
          text: 'Need this printed on high-density silk canvas ASAP! Stunning work Elena ✨',
          likesCount: 12,
          isLiked: false,
          createdAt: '2026-02-28T19:20:00Z',
        },
      ],
      'post-2': [
        {
          id: 'comm-2-1',
          postId: 'post-2',
          authorId: 'user-elena',
          author: {
            id: 'user-elena',
            username: 'elena_vibe',
            displayName: 'Elena Rostova',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            isVerified: true,
          },
          text: 'That golden hour glow on the ridge is surreal Leo! Incredible shot 🏔',
          likesCount: 32,
          isLiked: false,
          createdAt: '2026-02-28T14:35:00Z',
        },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem('chubby_comments_map', JSON.stringify(commentsMap));
  }, [commentsMap]);

  useEffect(() => {
    const unsubPostCreated = StorageService.on('post_created', () => setPosts(StorageService.getPosts()));
    const unsubPostUpdated = StorageService.on('post_updated', () => setPosts(StorageService.getPosts()));
    const unsubPostDeleted = StorageService.on('post_deleted', () => setPosts(StorageService.getPosts()));
    const unsubReelCreated = StorageService.on('reel_created', () => setReels(StorageService.getReels()));
    const unsubReelUpdated = StorageService.on('reel_updated', () => setReels(StorageService.getReels()));
    const unsubStoryAdded = StorageService.on('story_added', () => setStories(StorageService.getStories()));
    const unsubReset = StorageService.on('data_reset', () => {
      setPosts(StorageService.getPosts());
      setReels(StorageService.getReels());
      setStories(StorageService.getStories());
    });

    return () => {
      unsubPostCreated();
      unsubPostUpdated();
      unsubPostDeleted();
      unsubReelCreated();
      unsubReelUpdated();
      unsubStoryAdded();
      unsubReset();
    };
  }, []);

  const createPost = (postData: Partial<Post>) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      media: postData.media || [
        {
          id: `m-${Date.now()}`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
          aspectRatio: '4:5',
        },
      ],
      caption: postData.caption || '',
      hashtags: postData.hashtags || [],
      location: postData.location,
      music: postData.music,
      taggedUsers: postData.taggedUsers || [],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      allowComments: postData.allowComments !== false,
      allowSharing: postData.allowSharing !== false,
      audience: postData.audience || 'public',
      createdAt: new Date().toISOString(),
    };

    StorageService.addPost(newPost);
    sounds.playMessageSent();
    showToast('Post published to feed! 🚀');
  };

  const deletePost = (postId: string) => {
    StorageService.deletePost(postId);
    showToast('Post deleted.');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    sounds.playLikePop();
    StorageService.toggleLikePost(postId, currentUser.id);
  };

  const toggleSavePost = (postId: string) => {
    if (!currentUser) return;
    const updated = StorageService.toggleSavePost(postId, currentUser.id);
    if (updated?.isSaved) {
      showToast('Saved to your collection! 🔖');
    } else {
      showToast('Removed from saved.');
    }
  };

  const toggleLikeReel = (reelId: string) => {
    if (!currentUser) return;
    sounds.playLikePop();
    StorageService.toggleLikeReel(reelId, currentUser.id);
  };

  const openStoryViewer = (userStory: UserStories) => {
    setActiveStoryViewerUser(userStory);
  };

  const closeStoryViewer = () => {
    setActiveStoryViewerUser(null);
  };

  const createStory = (
    mediaUrl: string,
    mediaType: 'image' | 'video',
    caption?: string,
    poll?: any,
    questionPrompt?: any
  ) => {
    if (!currentUser) return;
    const storyItem: StoryItem = {
      id: `st-${Date.now()}`,
      userId: currentUser.id,
      mediaUrl,
      mediaType,
      caption,
      poll,
      questionPrompt,
      viewersCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    StorageService.addStory(currentUser.id, storyItem);
    sounds.playMessageSent();
    showToast('Story added! Live for 24 hours 🕒');
  };

  const voteStoryPoll = (storyId: string, optionIndex: number) => {
    setStories((prev) =>
      prev.map((userStory) => ({
        ...userStory,
        items: userStory.items.map((item) => {
          if (item.id === storyId && item.poll) {
            const updatedOptions = item.poll.options.map((opt, idx) =>
              idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
            );
            return {
              ...item,
              poll: {
                ...item.poll,
                options: updatedOptions,
                userVotedIndex: optionIndex,
              },
            };
          }
          return item;
        }),
      }))
    );
    showToast('Poll vote recorded! 📊');
  };

  const respondStoryQuestion = (storyId: string, answer: string) => {
    if (!currentUser) return;
    setStories((prev) =>
      prev.map((userStory) => ({
        ...userStory,
        items: userStory.items.map((item) => {
          if (item.id === storyId && item.questionPrompt) {
            return {
              ...item,
              questionPrompt: {
                ...item.questionPrompt,
                responses: [
                  ...(item.questionPrompt.responses || []),
                  { userId: currentUser.id, username: currentUser.username, answer },
                ],
              },
            };
          }
          return item;
        }),
      }))
    );
    showToast('Response sent to story creator! 💬');
  };

  // Comments
  const getComments = (postId: string): Comment[] => {
    return commentsMap[postId] || [];
  };

  const addComment = (postId: string, text: string, parentId?: string, replyToUsername?: string) => {
    if (!currentUser || !text.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      text: text.trim(),
      likesCount: 0,
      isLiked: false,
      parentId,
      replyToUsername,
      createdAt: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));

    // Update post comments count
    const post = StorageService.getPostById(postId);
    if (post) {
      StorageService.updatePost({ ...post, commentsCount: post.commentsCount + 1 });
      if (post.authorId !== currentUser.id) {
        StorageService.addNotification({
          id: `notif-c-${Date.now()}`,
          recipientId: post.authorId,
          actor: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatar: currentUser.avatar,
          },
          type: 'comment_post',
          title: `${currentUser.displayName} commented: "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`,
          targetId: postId,
          targetPreview: post.media[0]?.url,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    sounds.playMessageSent();
    showToast('Comment posted! 💬');
  };

  const deleteComment = (postId: string, commentId: string) => {
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));

    const post = StorageService.getPostById(postId);
    if (post) {
      StorageService.updatePost({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) });
    }
    showToast('Comment deleted.');
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    sounds.playLikePop();
    setCommentsMap((prev) => {
      const list = prev[postId] || [];
      return {
        ...prev,
        [postId]: list.map((c) => {
          if (c.id === commentId) {
            const isLiked = !c.isLiked;
            return {
              ...c,
              isLiked,
              likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
            };
          }
          return c;
        }),
      };
    });
  };

  const reportContent = (
    targetType: 'post' | 'comment' | 'user' | 'message',
    targetId: string,
    category: any,
    reason: string,
    contentSnippet?: string
  ) => {
    if (!currentUser) return;
    StorageService.addReport({
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      targetType,
      targetId,
      targetContent: contentSnippet,
      category,
      reason,
      status: 'pending',
      aiRiskScore: 0.75,
      aiFlags: [category],
      createdAt: new Date().toISOString(),
    });
    showToast('Report submitted. Our moderation team will review it.', 'info');
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        reels,
        stories,
        activeStoryViewerUser,
        openStoryViewer,
        closeStoryViewer,
        createPost,
        deletePost,
        toggleLikePost,
        toggleSavePost,
        toggleLikeReel,
        createStory,
        voteStoryPoll,
        respondStoryQuestion,
        getComments,
        addComment,
        deleteComment,
        toggleLikeComment,
        reportContent,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within a PostProvider');
  return context;
};
