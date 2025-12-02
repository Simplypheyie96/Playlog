import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { LeaderboardCard } from '../LeaderboardCard';
import { StatCard } from '../StatCard';
import { ActivityFeed } from '../ActivityFeed';
import { useStore } from '../../lib/store';
import { rankPlayers, getPlayerStats, getMostPlayedGame } from '../../lib/utils';
import { GAMES } from '../../lib/types';

interface HomePageProps {
  onPlayerClick: (playerId: string) => void;
}

export function HomePage({ onPlayerClick }: HomePageProps) {
  const { players, results } = useStore();
  
  const rankedPlayers = rankPlayers(players, results);
  const mostPlayedGame = getMostPlayedGame(results);
  const totalGames = results.length;
  
  // Calculate this week's games
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekGames = results.filter(
    r => new Date(r.timestamp) > oneWeekAgo
  ).length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Global Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          Who's leading the family rankings?
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Games"
          value={totalGames}
          icon={Trophy}
          color="var(--color-game-ludo)"
        />
        <StatCard
          title="This Week"
          value={thisWeekGames}
          icon={Calendar}
          color="var(--color-success)"
        />
        <StatCard
          title="Most Played"
          value={mostPlayedGame ? GAMES[mostPlayedGame].name : 'None'}
          icon={TrendingUp}
          color="var(--color-game-snakes)"
        />
      </div>
      
      {/* Leaderboard */}
      <div>
        <h2 className="mb-4">Rankings</h2>
        <div className="space-y-3">
          {rankedPlayers.map((entry, index) => {
            const player = players.find(p => p.id === entry.id)!;
            const stats = getPlayerStats(player, results, totalGames);
            
            return (
              <LeaderboardCard
                key={player.id}
                player={player}
                rank={index + 1}
                wins={entry.wins}
                currentStreak={stats.currentStreak}
                onClick={() => onPlayerClick(player.id)}
              />
            );
          })}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="mb-4">Recent Activity</h2>
        <ActivityFeed results={results} players={players} maxItems={5} />
      </div>
    </div>
  );
}
