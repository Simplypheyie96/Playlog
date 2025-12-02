import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl'
};

const rankColors = {
  1: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white shadow-lg shadow-[#FFD700]/60',
  2: 'bg-gradient-to-br from-[#E0E7FF] to-[#A5B4FC] text-indigo-900 shadow-lg shadow-[#A5B4FC]/50',
  3: 'bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] text-white shadow-lg shadow-[#FF8C42]/50'
};

export function RankBadge({ rank, size = 'md', animate = false }: RankBadgeProps) {
  const colorClass = rankColors[rank as keyof typeof rankColors] || 
    'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700';
  
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', duration: 0.6 }
  } : {};
  
  return (
    <Component
      {...animationProps}
      className={cn(
        'rounded-full flex items-center justify-center font-bold shadow-md',
        sizeClasses[size],
        colorClass
      )}
    >
      {rank}
    </Component>
  );
}