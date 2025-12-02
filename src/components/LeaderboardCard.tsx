import { motion } from 'motion/react';
import { RankedPlayer } from '../lib/ranking';
import { Avatar } from './Avatar';
import { RankBadge } from './RankBadge';
import { PointsChip } from './PointsChip';
import { StreakPill } from './StreakPill';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

interface LeaderboardCardProps {
  rankedPlayer: RankedPlayer;
  index: number;
  animate?: boolean;
  onClick?: () => void;
}

export function LeaderboardCard({ rankedPlayer, index, animate = true, onClick }: LeaderboardCardProps) {
  const { rank, player, totalPoints, totalWins, currentStreak } = rankedPlayer;
  
  const isTopThree = rank <= 3;
  
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.3 }
  } : {};
  
  const rankStyles = {
    1: 'border-2 border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-lg shadow-[#0ea5e9]/20',
    2: 'border-2 border-[#0ea5e9]/60 bg-[#0ea5e9]/5',
    3: 'border-2 border-[#0ea5e9]/40 bg-[#0ea5e9]/5'
  };
  
  // Colorful borders for non-top-three
  const borderColors = ['border-l-[#0ea5e9]', 'border-l-[#06B6D4]', 'border-l-[#10B981]'];
  const borderColor = !isTopThree ? borderColors[(rank - 4) % borderColors.length] : '';
  
  return (
    <Component
      {...animationProps}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl transition-all glass',
        isTopThree
          ? rankStyles[rank as keyof typeof rankStyles]
          : `border border-l-4 ${borderColor}`,
        onClick && 'cursor-pointer glass-hover'
      )}
    >
      <RankBadge rank={rank} size={isTopThree ? 'md' : 'sm'} animate={false} />
      
      <Avatar player={player} size="md" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{player.name}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <PointsChip points={totalPoints} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="w-3 h-3" />
            <span>{totalWins}</span>
          </div>
          {currentStreak > 0 && <StreakPill streak={currentStreak} type="current" />}
        </div>
      </div>
    </Component>
  );
}