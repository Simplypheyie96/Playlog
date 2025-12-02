import { Player } from '../lib/types';
import { cn } from '../lib/utils';

interface AvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
  xl: 'w-28 h-28 text-5xl'
};

const nameSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export function Avatar({ player, size = 'md', showName = false, className }: AvatarProps) {
  const avatar = player.avatar || player.name.charAt(0).toUpperCase();
  const isEmoji = /\p{Emoji}/u.test(avatar);
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-transform hover:scale-105',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: player.color || '#7C5CFF'
        }}
      >
        {isEmoji ? (
          <span className="leading-none">{avatar}</span>
        ) : (
          <span className="text-white font-semibold leading-none">{avatar}</span>
        )}
      </div>
      {showName && (
        <span className={cn('font-medium', nameSize[size])}>{player.name}</span>
      )}
    </div>
  );
}
