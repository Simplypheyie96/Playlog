import { useState } from 'react';
import { motion } from 'motion/react';
import { GameResult } from '../lib/types';
import { Player } from '../lib/types';
import { GAMES } from '../lib/types';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecentActivityProps {
  results: GameResult[];
  players: Player[];
  onEdit: (result: GameResult) => void;
  onDelete: (resultId: string) => void;
  limit?: number;
}

// Simple date formatting function
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

function formatFullDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function RecentActivity({ results, players, onEdit, onDelete, limit }: RecentActivityProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const displayResults = limit ? sortedResults.slice(0, limit) : sortedResults;
  
  if (displayResults.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      {displayResults.map((result, index) => {
        const game = GAMES[result.gameId];
        const winner = players.find(p => p.id === result.positions[0]?.playerId);
        const isExpanded = expandedId === result.id;
        
        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div
              className="flex items-center gap-3 p-4 cursor-pointer glass-hover transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : result.id)}
            >
              <div className="text-2xl">{game.emoji}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">
                    {game.name}
                  </span>
                  {result.isTwoPlayerDuel && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30">
                      Duel
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {winner && <Avatar player={winner} size="xs" />}
                  <span className="text-sm text-muted-foreground truncate">
                    {winner?.name} won
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(new Date(result.timestamp))}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(isExpanded ? null : result.id);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border p-4 space-y-3"
              >
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Positions</div>
                  <div className="space-y-2">
                    {result.positions.map((pos) => {
                      const player = players.find(p => p.id === pos.playerId);
                      if (!player) return null;
                      
                      const medals = ['🥇', '🥈', '🥉'];
                      
                      return (
                        <div key={pos.playerId} className="flex items-center gap-3 p-2 glass rounded-lg">
                          <span className="text-xl">
                            {pos.position <= 3 ? medals[pos.position - 1] : `#${pos.position}`}
                          </span>
                          <Avatar player={player} size="xs" />
                          <span className="text-sm">{player.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            +{pos.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {result.notes && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm glass rounded-lg p-2">
                      {result.notes}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {formatFullDate(new Date(result.timestamp))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(result);
                    }}
                    className="flex-1 glass glass-hover"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this result?')) {
                        onDelete(result.id);
                      }
                    }}
                    className="flex-1 bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}