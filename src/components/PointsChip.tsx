import { cn } from '../lib/utils';
import { Sparkles } from 'lucide-react';

interface PointsChipProps {
  points: number;
  className?: string;
}

export function PointsChip({ points, className }: PointsChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30',
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      <span className="text-xs font-medium">{Math.round(points)}</span>
    </div>
  );
}