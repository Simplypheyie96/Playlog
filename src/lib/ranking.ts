import { Player, Result, GameId } from './types';

export type TimeFilter = 'all' | 'month' | 'year';

export interface PlayerStats {
  playerId: string;
  totalPoints: number;
  totalWins: number;
  gamesPlayed: number;
  winPercentage: number;
  currentStreak: number;
  longestStreak: number;
  pointsByGame: Record<GameId, number>;
  winsByGame: Record<GameId, number>;
  gamesByGame: Record<GameId, number>;
  lastWinTimestamp?: string;
  lastFirstPlaceTimestamp?: string;
  mostWonGame?: GameId;
  mostWonGameCount?: number;
}

export interface RankedPlayer extends PlayerStats {
  rank: number;
  player: Player;
}

/**
 * Filter results by time period
 */
export function filterResultsByTime(results: Result[], timeFilter: TimeFilter): Result[] {
  if (timeFilter === 'all') return results;
  
  const now = new Date();
  const cutoffDate = new Date();
  
  if (timeFilter === 'month') {
    cutoffDate.setMonth(now.getMonth() - 1);
  } else if (timeFilter === 'year') {
    cutoffDate.setFullYear(now.getFullYear() - 1);
  }
  
  return results.filter(r => new Date(r.timestamp) >= cutoffDate);
}

/**
 * Calculate comprehensive statistics for a player
 */
export function calculatePlayerStats(
  playerId: string,
  results: Result[]
): PlayerStats {
  console.log(`📈 Calculating stats for player ${playerId} from ${results.length} total results`);
  
  let totalPoints = 0;
  let totalWins = 0;
  let gamesPlayed = 0;
  const pointsByGame: Record<GameId, number> = {} as Record<GameId, number>;
  const winsByGame: Record<GameId, number> = {} as Record<GameId, number>;
  const gamesByGame: Record<GameId, number> = {} as Record<GameId, number>;
  let lastWinTimestamp: string | undefined;
  let lastFirstPlaceTimestamp: string | undefined;

  // Sort results by timestamp descending for streak calculation
  const sortedResults = [...results].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate points and wins
  for (const result of results) {
    const playerPosition = result.positions.find(p => p.playerId === playerId);
    if (playerPosition) {
      gamesPlayed++;
      totalPoints += playerPosition.points;
      
      console.log(`  Result ${result.id}: position=${playerPosition.position}, points=${playerPosition.points}, game=${result.gameId}`);
      
      if (!(result.gameId in pointsByGame)) {
        pointsByGame[result.gameId] = 0;
        winsByGame[result.gameId] = 0;
        gamesByGame[result.gameId] = 0;
      }
      
      pointsByGame[result.gameId] += playerPosition.points;
      gamesByGame[result.gameId]++;
      
      console.log(`    ✅ Game count for ${result.gameId}: ${gamesByGame[result.gameId]}`);
      
      if (playerPosition.position === 1) {
        totalWins++;
        winsByGame[result.gameId]++;
        
        if (!lastFirstPlaceTimestamp || result.timestamp > lastFirstPlaceTimestamp) {
          lastFirstPlaceTimestamp = result.timestamp;
        }
      }
      
      if (!lastWinTimestamp || result.timestamp > lastWinTimestamp) {
        lastWinTimestamp = result.timestamp;
      }
    }
  }

  console.log(`  TOTALS: gamesPlayed=${gamesPlayed}, totalPoints=${totalPoints}, totalWins=${totalWins}`);

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (const result of sortedResults) {
    const playerPosition = result.positions.find(p => p.playerId === playerId);
    if (playerPosition) {
      if (playerPosition.position === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
  }

  // Calculate current streak from most recent results
  for (const result of sortedResults) {
    const playerPosition = result.positions.find(p => p.playerId === playerId);
    if (playerPosition) {
      if (playerPosition.position === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const winPercentage = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;
  
  // Find most won game
  let mostWonGame: GameId | undefined;
  let mostWonGameCount = 0;
  Object.entries(winsByGame).forEach(([gameId, wins]) => {
    if (wins > mostWonGameCount) {
      mostWonGame = gameId as GameId;
      mostWonGameCount = wins;
    }
  });

  return {
    playerId,
    totalPoints,
    totalWins,
    gamesPlayed,
    winPercentage,
    currentStreak,
    longestStreak,
    pointsByGame,
    winsByGame,
    gamesByGame,
    lastWinTimestamp,
    lastFirstPlaceTimestamp,
    mostWonGame,
    mostWonGameCount
  };
}

/**
 * Rank players by total points with tiebreakers
 */
export function rankPlayers(
  players: Player[],
  results: Result[]
): RankedPlayer[] {
  const playerStats = players.map(player => ({
    ...calculatePlayerStats(player.id, results),
    player
  }));

  // Sort by:
  // 1. Total points descending
  // 2. Most recent first-place timestamp
  // 3. Total wins descending
  // 4. Name alphabetical
  const sorted = playerStats.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    
    if (a.lastFirstPlaceTimestamp && b.lastFirstPlaceTimestamp) {
      const timeA = new Date(a.lastFirstPlaceTimestamp).getTime();
      const timeB = new Date(b.lastFirstPlaceTimestamp).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
    } else if (a.lastFirstPlaceTimestamp) {
      return -1;
    } else if (b.lastFirstPlaceTimestamp) {
      return 1;
    }
    
    if (b.totalWins !== a.totalWins) {
      return b.totalWins - a.totalWins;
    }
    
    return a.player.name.localeCompare(b.player.name);
  });

  // Assign ranks
  return sorted.map((stats, index) => ({
    ...stats,
    rank: index + 1
  }));
}

/**
 * Get leaderboard for a specific game
 */
export function getGameLeaderboard(
  players: Player[],
  results: Result[],
  gameId: GameId
): RankedPlayer[] {
  // Calculate stats from ALL results (not just the game-specific ones)
  const allRanked = rankPlayers(players, results);
  
  // Re-rank by game-specific points (all players shown, even with 0 games)
  const reranked = allRanked.sort((a, b) => {
    const aPoints = a.pointsByGame[gameId] || 0;
    const bPoints = b.pointsByGame[gameId] || 0;
    
    if (bPoints !== aPoints) {
      return bPoints - aPoints;
    }
    
    const aWins = a.winsByGame[gameId] || 0;
    const bWins = b.winsByGame[gameId] || 0;
    
    if (bWins !== aWins) {
      return bWins - aWins;
    }
    
    const aGames = a.gamesByGame[gameId] || 0;
    const bGames = b.gamesByGame[gameId] || 0;
    
    if (bGames !== aGames) {
      return bGames - aGames;
    }
    
    // Tiebreaker: most recent win
    if (a.lastFirstPlaceTimestamp && b.lastFirstPlaceTimestamp) {
      const timeA = new Date(a.lastFirstPlaceTimestamp).getTime();
      const timeB = new Date(b.lastFirstPlaceTimestamp).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
    } else if (a.lastFirstPlaceTimestamp) {
      return -1;
    } else if (b.lastFirstPlaceTimestamp) {
      return 1;
    }
    
    return a.player.name.localeCompare(b.player.name);
  });
  
  // Reassign ranks
  return reranked.map((stats, index) => ({
    ...stats,
    rank: index + 1
  }));
}

/**
 * Get recent results for a player
 */
export function getPlayerRecentResults(
  playerId: string,
  results: Result[],
  limit: number = 10
): Result[] {
  return results
    .filter(r => r.positions.some(p => p.playerId === playerId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get global statistics
 */
export interface GlobalStats {
  totalGamesPlayed: number;
  gamesByType: Record<GameId, number>;
  mostPlayedGame: GameId | null;
  totalPlayers: number;
  activePlayersLast7Days: number;
}

export function calculateGlobalStats(
  players: Player[],
  results: Result[]
): GlobalStats {
  const gamesByType: Record<GameId, number> = {} as Record<GameId, number>;
  let totalGamesPlayed = results.length;
  
  results.forEach(result => {
    gamesByType[result.gameId] = (gamesByType[result.gameId] || 0) + 1;
  });
  
  const mostPlayedGame = Object.entries(gamesByType)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as GameId | null;
  
  // Calculate active players in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activePlayerIds = new Set<string>();
  results.forEach(result => {
    if (new Date(result.timestamp) >= sevenDaysAgo) {
      result.positions.forEach(p => activePlayerIds.add(p.playerId));
    }
  });
  
  return {
    totalGamesPlayed,
    gamesByType,
    mostPlayedGame,
    totalPlayers: players.length,
    activePlayersLast7Days: activePlayerIds.size
  };
}