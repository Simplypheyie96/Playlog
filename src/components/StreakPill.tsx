import { cn } from '../lib/utils';
import { Flame, Award } from 'lucide-react';

interface StreakPillProps {
  streak: number;
  type?: 'current' | 'longest';
  className?: string;
}

export function StreakPill({ streak, type = 'current', className }: StreakPillProps) {
  if (streak === 0) return null;
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        type === 'current'
          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        className
      )}
    >
      {type === 'current' ? <Flame className="w-3 h-3" /> : <Award className="w-3 h-3" />}
      <span>{streak}</span>
    </div>
  );
}
