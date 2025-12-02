import { motion } from 'motion/react';
import { RankedPlayer } from '../lib/ranking';
import { Avatar } from './Avatar';
import { Trophy, Star, Award, Medal } from 'lucide-react';
import { cn } from '../lib/utils';

interface GameLeaderboardCardProps {
  rankedPlayer: RankedPlayer;
  index: number;
  gameId: string;
  animate?: boolean;
}

export function GameLeaderboardCard({ rankedPlayer, index, gameId, animate = true }: GameLeaderboardCardProps) {
  const gamePoints = rankedPlayer.pointsByGame[gameId] || 0;
  const gameWins = rankedPlayer.winsByGame[gameId] || 0;
  const gameCount = rankedPlayer.gamesByGame[gameId] || 0;
  
  const { player, rank } = rankedPlayer;
  const isWinner = rank === 1;
  const isTop3 = rank <= 3;
  const gameWinRate = gameCount > 0 ? Math.round((gameWins / gameCount) * 100) : 0;
  
  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6" />;
      case 2: return <Medal className="w-6 h-6" />;
      case 3: return <Award className="w-6 h-6" />;
      default: return `#${rank}`;
    }
  };
  
  const card = (
    <div
      className={cn(
        'relative rounded-2xl p-4 transition-all duration-200',
        'glass',
        isTop3 
          ? 'border-2 border-[#0ea5e9]/40 shadow-lg shadow-[#0ea5e9]/10 bg-[#0ea5e9]/5' 
          : 'border border-white/[0.08] hover:border-white/[0.13]',
        isWinner && 'border-[#0ea5e9] shadow-xl shadow-[#0ea5e9]/20',
        'active:scale-[0.98]'
      )}
    >
      {/* Top 3 Glow Effect */}
      {isTop3 && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent rounded-2xl pointer-events-none" />
      )}
      
      <div className="relative flex items-center gap-4">
        {/* Rank Badge */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold',
            isWinner 
              ? 'bg-gradient-to-br from-[#0ea5e9] to-[#1e40af] text-white shadow-lg shadow-[#0ea5e9]/50' 
              : isTop3
              ? 'bg-gradient-to-br from-[#0ea5e9]/60 to-[#1e40af]/60 text-white'
              : 'glass text-[#B8B8D0]'
          )}
        >
          {rank <= 3 ? getRankIcon() : `#${rank}`}
        </div>
        
        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar player={player} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-white">
                {player.name}
              </h3>
            </div>
          </div>
          
          {/* Game Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {/* Total Points in Game */}
            <div className="bg-white/[0.03] rounded-lg p-2">
              <div className="text-[10px] text-slate-400 uppercase mb-0.5">
                Points
              </div>
              <div className="text-lg font-semibold text-[#0ea5e9]">
                {gamePoints}
              </div>
            </div>
            
            {/* Games Played */}
            <div className="bg-white/[0.03] rounded-lg p-2">
              <div className="text-[10px] text-[#B8B8D0] uppercase mb-0.5">
                Played
              </div>
              <div className="text-lg font-semibold text-white">
                {gameCount}
              </div>
            </div>
            
            {/* Wins */}
            <div className="bg-white/[0.03] rounded-lg p-2">
              <div className="text-[10px] text-[#B8B8D0] uppercase mb-0.5">
                Wins
              </div>
              <div className="text-lg font-semibold text-green-400">
                {gameWins}
              </div>
            </div>
          </div>
          
          {/* Win Rate Bar */}
          {gameCount > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase">
                  Win Rate
                </span>
                <span className="text-xs font-medium text-[#0ea5e9]">
                  {gameWinRate}%
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] rounded-full transition-all duration-500"
                  style={{ width: `${gameWinRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 px-2 py-1 rounded-full text-[10px] font-bold shadow-lg shadow-yellow-400/50 flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-950" />
            LEADER
          </div>
        </div>
      )}
    </div>
  );
  
  if (!animate) {
    return card;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      {card}
    </motion.div>
  );
}