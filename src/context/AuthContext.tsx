import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  isOnboarding: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  toggleFollow: (targetUserId: string) => { isFollowing: boolean; isRequested: boolean };
  isFollowing: (targetUserId: string) => boolean;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  toggleMute: (userId: string) => boolean;
  isMuted: (userId: string) => boolean;
  completeOnboarding: (data: Partial<User>) => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  StorageService.init();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => StorageService.getBlockedUsers());
  const [mutedUsers, setMutedUsers] = useState<string[]>(() => StorageService.getMutedUsers());

  useEffect(() => {
    const unsubAuth = StorageService.on('auth_changed', () => {
      const user = StorageService.getCurrentUser();
      setCurrentUser(user);
      setAllUsers(StorageService.getUsers());
    });

    const unsubUsers = StorageService.on('user_updated', () => {
      setCurrentUser(StorageService.getCurrentUser());
      setAllUsers(StorageService.getUsers());
    });

    const unsubBlock = StorageService.on('user_blocked', () => {
      setBlockedUsers(StorageService.getBlockedUsers());
    });

    const unsubUnblock = StorageService.on('user_unblocked', () => {
      setBlockedUsers(StorageService.getBlockedUsers());
    });

    const unsubMute = StorageService.on('user_mute_toggled', () => {
      setMutedUsers(StorageService.getMutedUsers());
    });

    return () => {
      unsubAuth();
      unsubUsers();
      unsubBlock();
      unsubUnblock();
      unsubMute();
    };
  }, []);

  const login = async (emailOrUsername: string, _pass: string): Promise<boolean> => {
    const users = StorageService.getUsers();
    const clean = emailOrUsername.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );

    if (found) {
      StorageService.setCurrentUserId(found.id);
      setCurrentUser(found);
      showToast(`Welcome back, ${found.displayName}! 👋`);
      return true;
    }

    showToast('Invalid credentials. Try demo accounts or create a new profile.', 'error');
    return false;
  };

  const signup = async (userData: Partial<User>): Promise<boolean> => {
    const users = StorageService.getUsers();
    const cleanUsername = (userData.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      showToast('Username must be at least 3 characters (letters, numbers, _)', 'error');
      return false;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showToast('Username already taken. Please choose another.', 'error');
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      displayName: userData.displayName || cleanUsername,
      email: userData.email || `${cleanUsername}@chubbychat.app`,
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      bio: userData.bio || 'New explorer on Chubby Chat ✨',
      isPrivate: !!userData.isPrivate,
      isVerified: false,
      isAdmin: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      status: 'online',
      interests: userData.interests || ['General'],
      createdAt: new Date().toISOString(),
    };

    StorageService.addUser(newUser);
    StorageService.setCurrentUserId(newUser.id);
    setCurrentUser(newUser);
    setAllUsers(StorageService.getUsers());

    setIsOnboarding(true);
    showToast('Account created! Welcome to Chubby Chat 🎉');
    return true;
  };

  const completeOnboarding = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    StorageService.updateUser(updated);
    setCurrentUser(updated);
    setIsOnboarding(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast("You're all set! Enjoy connecting on Chubby Chat ✨");
  };

  const logout = () => {
    showToast('Logged out securely.');
    const users = StorageService.getUsers();
    if (users.length > 0) {
      // Pick first user or demo admin
      StorageService.setCurrentUserId(users[0].id);
      setCurrentUser(users[0]);
    }
  };

  const switchUser = (userId: string) => {
    const user = StorageService.getUserById(userId);
    if (user) {
      StorageService.setCurrentUserId(user.id);
      setCurrentUser(user);
      showToast(`Switched active profile to @${user.username}`);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    StorageService.updateUser(updated);
    setCurrentUser(updated);
    showToast('Profile updated successfully! ✨');
  };

  const toggleFollow = (targetUserId: string) => {
    if (!currentUser) return { isFollowing: false, isRequested: false };
    const res = StorageService.toggleFollow(currentUser.id, targetUserId);
    setAllUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getUserById(currentUser.id) || currentUser);

    if (res.isFollowing) {
      showToast('Followed user! 🌟');
    } else if (res.isRequested) {
      showToast('Follow request sent! ⏳');
    } else {
      showToast('Unfollowed user.');
    }
    return res;
  };

  const isFollowing = (targetUserId: string): boolean => {
    if (!currentUser) return false;
    return StorageService.isFollowing(currentUser.id, targetUserId);
  };

  const blockUser = (userId: string) => {
    StorageService.blockUser(userId);
    setBlockedUsers(StorageService.getBlockedUsers());
    showToast('User has been blocked. Their content is hidden.', 'info');
  };

  const unblockUser = (userId: string) => {
    StorageService.unblockUser(userId);
    setBlockedUsers(StorageService.getBlockedUsers());
    showToast('User has been unblocked.');
  };

  const isBlocked = (userId: string) => {
    return blockedUsers.includes(userId);
  };

  const toggleMute = (userId: string) => {
    const isMuted = StorageService.toggleMuteUser(userId);
    setMutedUsers(StorageService.getMutedUsers());
    showToast(isMuted ? 'User muted.' : 'User unmuted.');
    return isMuted;
  };

  const isMuted = (userId: string) => {
    return mutedUsers.includes(userId);
  };

  const deleteAccount = () => {
    if (!currentUser) return;
    showToast('Account deleted.', 'info');
    StorageService.resetToDemoData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated: !!currentUser,
        isOnboarding,
        login,
        signup,
        logout,
        switchUser,
        updateProfile,
        toggleFollow,
        isFollowing,
        blockUser,
        unblockUser,
        isBlocked,
        toggleMute,
        isMuted,
        completeOnboarding,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
