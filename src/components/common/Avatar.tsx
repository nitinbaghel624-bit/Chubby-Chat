import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hasStory?: boolean;
  storyUnseen?: boolean;
  status?: 'online' | 'offline' | 'away';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5 border-[1px]',
  sm: 'w-2 h-2 border-[1.5px]',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  hasStory = false,
  storyUnseen = true,
  status,
  className = '',
  onClick,
}) => {
  const fallbackInitial = (alt || 'U').charAt(0).toUpperCase();

  const renderImage = () => {
    if (!src) {
      return (
        <div
          className={`flex items-center justify-center font-bold text-white bg-gradient-to-tr from-pink-500 to-violet-600 rounded-full ${sizeClasses[size]}`}
        >
          {fallbackInitial}
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={`object-cover rounded-full ${sizeClasses[size]}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to placeholder if broken link
          (e.currentTarget as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
        }}
      />
    );
  };

  const content = (
    <div className={`relative inline-block shrink-0 ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`} onClick={onClick}>
      {hasStory ? (
        <div
          className={`p-[2.5px] rounded-full transition-all duration-300 ${
            storyUnseen
              ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-sm'
              : 'bg-zinc-300 dark:bg-zinc-700'
          }`}
        >
          <div className="p-[2px] bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center">
            {renderImage()}
          </div>
        </div>
      ) : (
        renderImage()
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-white dark:border-zinc-950 ${statusSizeClasses[size]} ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'away'
              ? 'bg-amber-500'
              : 'bg-zinc-400'
          }`}
        />
      )}
    </div>
  );

  return content;
};
