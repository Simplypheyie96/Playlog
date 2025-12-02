import { Result, GameId } from './types';
import { generateId } from './utils';

/**
 * Generate demo results for testing
 * This creates a realistic set of game results over the past 30 days
 */
export function generateDemoData(playerIds: string[]): Result[] {
  const results: Result[] = [];
  const games: GameId[] = ['ludo', 'snakes', 'chess'];
  const now = new Date();
  
  // Generate 50 random games over the past 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    const gameId = games[Math.floor(Math.random() * games.length)];
    
    // Randomly select 1-2 winners
    const numWinners = Math.random() > 0.8 ? 2 : 1;
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, numWinners);
    
    results.push({
      id: generateId(),
      gameId,
      winners,
      timestamp: date.toISOString(),
      notes: Math.random() > 0.7 ? 'Great game!' : undefined
    });
  }
  
  // Sort by timestamp
  return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Add demo data to the store
 */
export function addDemoDataToStore() {
  const { addResult, players } = require('./store').useStore.getState();
  const playerIds = players.map((p: any) => p.id);
  const demoResults = generateDemoData(playerIds);
  
  // Note: This would replace the addResult calls with direct state import
  // For production, you'd want to use the importState function
  console.log('Demo data generated:', demoResults.length, 'results');
  return demoResults;
}
