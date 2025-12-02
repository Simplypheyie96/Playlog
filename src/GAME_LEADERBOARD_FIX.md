# Game Leaderboard Logic Fix 🔧

## Issue Identified

The game-specific leaderboard was showing incorrect game counts because:
1. It was including ALL players, even those who never played the selected game
2. It was ranking by total points across all games, not game-specific points

## Root Cause

When filtering to a specific game (e.g., Ludo):
- `getGameLeaderboard` filtered results to only Ludo games
- `rankPlayers` calculated stats for ALL players using those filtered results
- Players who played Ludo would have correct stats
- **Players who never played Ludo would have 0 games but still appear in the list**
- **Ranking was based on totalPoints (which would be 0) instead of game-specific points**

## Solution

Updated `getGameLeaderboard` in `/lib/ranking.ts` to:

### 1. Filter Out Non-Participants
```typescript
const playersWhoPlayed = allRanked.filter(p => p.gamesPlayed > 0);
```
Only show players who actually played this specific game.

### 2. Re-Rank by Game-Specific Points
```typescript
const reranked = playersWhoPlayed.sort((a, b) => {
  const aPoints = a.pointsByGame[gameId] || 0;
  const bPoints = b.pointsByGame[gameId] || 0;
  
  if (bPoints !== aPoints) {
    return bPoints - aPoints; // Primary: Points in THIS game
  }
  
  const aWins = a.winsByGame[gameId] || 0;
  const bWins = b.winsByGame[gameId] || 0;
  
  if (bWins !== aWins) {
    return bWins - aWins; // Secondary: Wins in THIS game
  }
  
  // Tertiary: Most recent win, then alphabetical
  ...
});
```

### 3. Reassign Ranks
```typescript
return reranked.map((stats, index) => ({
  ...stats,
  rank: index + 1 // Correct ranks after filtering and re-sorting
}));
```

## How Stats Are Now Calculated

For each game-specific leaderboard (e.g., Ludo):

1. **Filter**: `results.filter(r => r.gameId === 'ludo')`
   - Only Ludo games are considered

2. **Calculate Stats**: `calculatePlayerStats(playerId, ludoResults)`
   - For each player, iterate through Ludo results
   - Count games where `playerPosition` exists
   - This gives us:
     - `gamesPlayed`: Number of Ludo games this player participated in
     - `pointsByGame['ludo']`: Total points from Ludo
     - `winsByGame['ludo']`: Number of Ludo wins

3. **Filter Participants**: Only show players with `gamesPlayed > 0`
   - If a player never played Ludo, they won't appear

4. **Rank by Game Points**: Sort by `pointsByGame['ludo']`
   - Not by `totalPoints` (which includes all games)
   - This ensures proper ranking within that specific game

## Example Scenario

### Data:
- Wuraola: 2 Ludo games, 4 Snakes games
- Feyikemi: 2 Ludo games, 4 Snakes games  
- Joy: 0 Ludo games, 6 Snakes games

### Ludo Leaderboard Will Show:
1. **Wuraola**
   - Games Played: 2 (only Ludo)
   - Points: X (only from Ludo)
   - Wins: Y (only Ludo wins)

2. **Feyikemi**
   - Games Played: 2 (only Ludo)
   - Points: Z (only from Ludo)
   - Wins: W (only Ludo wins)

**Joy will not appear** (0 Ludo games)

### Snakes Leaderboard Will Show:
1. **Joy** - 6 games
2. **Wuraola** - 4 games
3. **Feyikemi** - 4 games

All stats are game-specific.

## Verification Steps

To verify the fix works:

1. ✅ Check that players who didn't play a game don't appear in that game's leaderboard
2. ✅ Verify "Games Played" matches actual participation in that specific game
3. ✅ Confirm "Wins" only counts wins in that specific game
4. ✅ Ensure "Points" only shows points earned in that specific game
5. ✅ Test ranking order matches game-specific points, not total points
6. ✅ Verify win rate percentage = (game wins / game plays) * 100

## Edge Cases Handled

- ✅ Player never played this game → Not shown in leaderboard
- ✅ Player played this game but never won → Shows 0 wins, 0% win rate
- ✅ Player played only one game type → Only appears in that leaderboard
- ✅ Tied points in a game → Tiebreaker by wins, then most recent win
- ✅ All players tied → Alphabetical order

## Technical Details

### Key Functions

**`calculatePlayerStats(playerId, results)`**
- Input: Player ID + filtered results (e.g., only Ludo games)
- Output: Stats object with game-specific breakdowns
- Logic: Iterates through results, counts participation

**`rankPlayers(players, results)`**
- Input: All players + filtered results
- Output: Ranked list by total points (from those results)
- Note: Calculates `totalPoints` from filtered results, so it's game-specific

**`getGameLeaderboard(players, results, gameId)`** ✨ **UPDATED**
- Input: All players + all results + specific game ID
- Process:
  1. Filter to game results
  2. Call rankPlayers (gets stats from filtered results)
  3. **Filter out non-participants** (new!)
  4. **Re-rank by game-specific points** (new!)
  5. Reassign ranks
- Output: Properly ranked game-specific leaderboard

## Impact

✅ **Accurate Game Counts**: Shows correct number of games played per game  
✅ **Correct Rankings**: Players ranked by performance in that game only  
✅ **Clean Leaderboards**: Only relevant players appear  
✅ **Proper Stats**: All displayed stats are game-specific  
✅ **Better UX**: Users see true competition within each game type  

---

**Status**: ✅ Fixed and tested  
**Files Modified**: `/lib/ranking.ts`
