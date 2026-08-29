import React from 'react';
import { Check } from 'lucide-react';

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({
  size = 'sm',
  className = '',
}) => {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const iconDim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <span
      title="Verified Account"
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white ${dim} ${className}`}
    >
      <Check className={`${iconDim} stroke-[3]`} />
    </span>
  );
};

export const AdminBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30 ${className}`}
    >
      Admin
    </span>
  );
};
