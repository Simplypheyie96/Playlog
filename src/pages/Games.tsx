import { useState } from 'react';
import { useStore } from '../lib/store';
import { getGameLeaderboard, rankPlayers } from '../lib/ranking';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { GameLeaderboardCard } from '../components/GameLeaderboardCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { RecordResultDialog } from '../components/RecordResultDialog';
import { GAMES, GameId } from '../lib/types';
import { Trophy, Target, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function Games() {
  const { players, results, settings } = useStore();
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const enabledGames = Object.entries(GAMES)
    .filter(([id]) => settings.enabledGames.includes(id))
    .map(([id, game]) => ({ id, ...game }));
  
  const gameResults = selectedGame === 'all' 
    ? results 
    : results.filter(r => r.gameId === selectedGame);
    
  // Filter results to only include those with positions
  const filteredResults = gameResults.filter(r => r.positions.length > 0);
  
  // Get leaderboard data
  // IMPORTANT: Pass ALL results to getGameLeaderboard, not filtered ones
  // The function will calculate stats from all games, then rank by specific game
  const allResults = results.filter(r => r.positions.length > 0);
  const gameLeaderboard = selectedGame === 'all' 
    ? rankPlayers(players, allResults)
    : getGameLeaderboard(players, allResults, selectedGame as GameId);
  
  // Calculate win details for selected game
  const winDetails = selectedGame !== 'all' 
    ? gameResults.filter(r => {
        const firstPlace = r.positions.find(p => p.position === 1);
        return firstPlace !== undefined;
      }).map(r => {
        const winner = r.positions.find(p => p.position === 1);
        const winnerPlayer = players.find(p => p.id === winner?.playerId);
        return {
          result: r,
          winner: winnerPlayer,
          timestamp: new Date(r.timestamp)
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    : [];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-28">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-1">🎮 Games</h1>
          <p className="text-sm text-muted-foreground">View stats and leaderboards by game</p>
        </div>
        
        {/* Game Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 pb-2">
          {/* All Games Tab */}
          <button
            onClick={() => setSelectedGame('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap text-xs sm:text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]',
              'active:scale-95',
              selectedGame === 'all'
                ? 'bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white border-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/30'
                : 'glass glass-hover'
            )}
          >
            <span className="text-base">🎮</span>
            <span className="font-medium">All Games</span>
          </button>
          
          {Object.entries(GAMES).map(([id, game]) => (
            <button
              key={id}
              onClick={() => setSelectedGame(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap text-xs sm:text-sm',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]',
                'active:scale-95',
                selectedGame === game.id
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white border-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/30'
                  : 'glass glass-hover'
              )}
            >
              <span className="text-base">{game.emoji}</span>
              <span className="font-medium">{game.name}</span>
            </button>
          ))}
        </div>
        
        {/* Game Stats */}
        <div
          className="glass rounded-2xl p-4 sm:p-6 mb-6 bg-[#0ea5e9]/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base text-muted-foreground mb-1">
                {selectedGame === 'all' ? 'Total Games Played' : `${GAMES[selectedGame].name} Games`}
              </h3>
              <div 
                key={gameResults.length}
                className="text-3xl sm:text-4xl font-bold"
              >
                {gameResults.length}
              </div>
              
              {/* Show leader info for specific games */}
              {selectedGame !== 'all' && gameLeaderboard.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-400/20 border border-yellow-400/40">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300">
                      {gameLeaderboard[0].player.name} leads
                    </span>
                  </div>
                  {gameLeaderboard.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      by {gameLeaderboard[0].pointsByGame[selectedGame] - gameLeaderboard[1].pointsByGame[selectedGame]} pts
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-5xl sm:text-6xl">
              {selectedGame === 'all' ? '🎮' : GAMES[selectedGame].emoji}
            </div>
          </div>
        </div>
        
        {/* Win Details (only for specific games) */}
        {selectedGame !== 'all' && winDetails.length > 0 && (
          <div
            className="glass rounded-2xl p-4 sm:p-5 mb-6"
          >
            <h3 className="text-base font-semibold mb-4">🏆 Win History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {winDetails.map((detail, index) => (
                <div
                  key={detail.result.id}
                  className="flex items-center justify-between p-3 glass rounded-xl glass-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" 
                         style={{ backgroundColor: detail.winner?.color || '#6366F1' }}>
                      {detail.winner?.avatar || ''}
                    </div>
                    <div>
                      <div className="font-medium">{detail.winner?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">
                        {detail.timestamp.toLocaleDateString()} at {detail.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full glass">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium">+{detail.result.positions.find(p => p.position === 1)?.points || 0} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Leaderboard */}
        {gameLeaderboard.length > 0 ? (
          <div
            className="space-y-3 sm:space-y-4"
          >
            <h2 className="text-xl sm:text-2xl">
              {selectedGame === 'all' ? 'Overall Leaderboard' : `${GAMES[selectedGame].name} Leaderboard`}
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {gameLeaderboard.map((rankedPlayer, index) => (
                <div key={rankedPlayer.playerId}>
                  {selectedGame === 'all' ? (
                    <LeaderboardCard
                      rankedPlayer={rankedPlayer}
                      index={index}
                      animate={true}
                    />
                  ) : (
                    <GameLeaderboardCard
                      rankedPlayer={rankedPlayer}
                      index={index}
                      gameId={selectedGame as GameId}
                      animate={true}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="glass rounded-2xl p-6 sm:p-8 text-center bg-[#0ea5e9]/5"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
              {selectedGame === 'all' ? '🎮' : GAMES[selectedGame].emoji}
            </div>
            <h3 className="text-lg sm:text-xl mb-2">No games played yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {selectedGame === 'all' 
                ? 'Start playing and record your results!'
                : `Start playing ${GAMES[selectedGame].name} and record your results!`
              }
            </p>
          </div>
        )}
        
        <FloatingActionButton onClick={() => setDialogOpen(true)} />
        <RecordResultDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </div>
  );
}