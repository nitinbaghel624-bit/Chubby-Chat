import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs rounded-xl gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-2',
    md: 'px-4 py-2 text-sm font-semibold rounded-2xl gap-2',
    lg: 'px-6 py-3 text-base font-semibold rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-pink-600 hover:bg-pink-500 text-white shadow-sm hover:shadow-pink-500/20 active:scale-[0.98]',
    gradient:
      'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-md hover:shadow-purple-500/25 active:scale-[0.98]',
    secondary:
      'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 active:scale-[0.98]',
    outline:
      'border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 active:scale-[0.98]',
    ghost:
      'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
