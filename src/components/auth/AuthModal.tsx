import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, switchUser, allUsers } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email || 'alex@chubbychat.app', password || 'password123');
      } else {
        if (!username.trim() || !displayName.trim()) {
          throw new Error('Please fill in your username and name');
        }
        await signup({
          email,
          username,
          displayName,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Hey there! I am using Chubby Chat ✨',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <span className="font-display font-black text-2xl">C</span>
          </div>
          <h2 className="font-display font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
            Chubby<span className="text-pink-500">Chat</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create an account to join the community.'}
          </p>
        </div>

        {/* Demo Fast Switch Profiles */}
        <div className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
            Quick One-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSwitch(u.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 hover:border-pink-500 border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-[1.02] text-left"
              >
                <Avatar src={u.avatar} size="xs" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {u.displayName.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">@{u.username}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="relative">
                <span className="text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address (e.g. alex@chubbychat.app)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            isLoading={isLoading}
            className="w-full py-3 mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-zinc-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-pink-500 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-pink-500 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
