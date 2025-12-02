import { TiePolicy, PositionEntry } from './types';

/**
 * Convert ordered positions to points using a points table
 */
export function assignPointsFromPositions(
  positions: { playerId: string; position: number }[],
  pointsTable: Record<number, number>,
  tiePolicy: TiePolicy = 'average'
): Record<string, number> {
  console.log('💎 assignPointsFromPositions called with:', {
    positions,
    pointsTable,
    tiePolicy
  });
  
  // group same positions for ties
  const grouped = new Map<number, string[]>();
  positions.forEach(p => {
    const playerList = grouped.get(p.position) || [];
    playerList.push(p.playerId);
    grouped.set(p.position, playerList);
  });

  const resultPoints: Record<string, number> = {};
  
  for (const [position, playerIds] of grouped.entries()) {
    const base = pointsTable[position] ?? 0;
    
    if (playerIds.length === 1) {
      resultPoints[playerIds[0]] = (resultPoints[playerIds[0]] || 0) + base;
      console.log(`  Position ${position}: ${playerIds[0]} gets ${base} points`);
    } else {
      // tie handling
      if (tiePolicy === 'average') {
        const split = base / playerIds.length;
        playerIds.forEach(id => {
          resultPoints[id] = (resultPoints[id] || 0) + split;
        });
        console.log(`  Position ${position} (TIE): ${playerIds.length} players share ${base} points (${split} each)`);
      } else if (tiePolicy === 'highest') {
        // award full base to all tied players
        playerIds.forEach(id => {
          resultPoints[id] = (resultPoints[id] || 0) + base;
        });
        console.log(`  Position ${position} (TIE): ${playerIds.length} players each get ${base} points`);
      } else {
        // lowest - award 0 points
        playerIds.forEach(id => {
          resultPoints[id] = (resultPoints[id] || 0) + 0;
        });
        console.log(`  Position ${position} (TIE): ${playerIds.length} players each get 0 points`);
      }
    }
  }
  
  console.log('💎 Final points map:', resultPoints);
  return resultPoints;
}

/**
 * Get the appropriate points table for a given number of players
 */
export function getPointsTableForPlayerCount(
  playerCount: number,
  pointsTableTemplate: Record<number, Record<number, number>>
): Record<number, number> {
  return pointsTableTemplate[playerCount] || {};
}

/**
 * Validate that positions are sequential and start from 1
 */
export function validatePositions(positions: { position: number }[]): boolean {
  if (positions.length === 0) return false;
  
  const positionNumbers = positions.map(p => p.position).sort((a, b) => a - b);
  
  // Check if positions start from 1
  if (positionNumbers[0] !== 1) return false;
  
  // Check if positions are sequential (allowing ties)
  for (let i = 1; i < positionNumbers.length; i++) {
    if (positionNumbers[i] > positionNumbers[i - 1] + 1) {
      return false;
    }
  }
  
  return true;
}