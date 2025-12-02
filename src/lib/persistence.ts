import { AppState, Player, Result } from './types';

const STORAGE_KEY = 'family-leaderboard-v1';
const CURRENT_VERSION = 1;

export const DEFAULT_STATE: AppState = {
  players: [
    { id: 'p1', name: 'You', avatar: '🙂', color: '#6C5CE7', createdAt: '2025-11-12T00:00:00Z' },
    { id: 'p2', name: 'Sister A', avatar: '😄', color: '#00BFA6', createdAt: '2025-11-12T00:00:00Z' },
    { id: 'p3', name: 'Sister B', avatar: '😎', color: '#FF7675', createdAt: '2025-11-12T00:00:00Z' },
    { id: 'p4', name: 'Mum', avatar: '🌸', color: '#FFD166', createdAt: '2025-11-12T00:00:00Z' },
    { id: 'p5', name: 'Dad', avatar: '🕶️', color: '#4D96FF', createdAt: '2025-11-12T00:00:00Z' }
  ],
  results: [],
  settings: {
    theme: 'system',
    compactMode: false,
    reducedMotion: false,
    enabledGames: ['ludo', 'snakes'],
    notifications: true
  },
  version: CURRENT_VERSION
};

export function loadState(): AppState {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available, using default state');
      return DEFAULT_STATE;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    
    const parsed = JSON.parse(stored) as AppState;
    return migrateState(parsed);
  } catch (error) {
    console.error('Failed to load state:', error);
    
    // If data is corrupted, backup and reset
    if (error instanceof SyntaxError) {
      try {
        const corrupted = localStorage.getItem(STORAGE_KEY);
        if (corrupted) {
          localStorage.setItem(`${STORAGE_KEY}-corrupted-backup`, corrupted);
          console.warn('Corrupted data backed up, using default state');
        }
      } catch (backupError) {
        console.error('Failed to backup corrupted data:', backupError);
      }
    }
    
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
    // Handle localStorage full error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export your data and clear old results.');
    }
    throw error;
  }
}

export function migrateState(state: AppState): AppState {
  let migrated = { ...state };
  
  // Migration logic for future versions
  if (migrated.version < CURRENT_VERSION) {
    // Apply migrations here
    migrated.version = CURRENT_VERSION;
  }
  
  // Ensure all required fields exist
  if (!migrated.settings) {
    migrated.settings = DEFAULT_STATE.settings;
  }
  
  if (!migrated.settings.enabledGames) {
    migrated.settings.enabledGames = ['ludo', 'snakes'];
  }
  
  if (migrated.settings.reducedMotion === undefined) {
    migrated.settings.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  return migrated;
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importJSON(json: string): AppState {
  try {
    const parsed = JSON.parse(json);
    
    // Validate schema
    if (!parsed.players || !Array.isArray(parsed.players)) {
      throw new Error('Invalid data: players array is required');
    }
    
    if (!parsed.results || !Array.isArray(parsed.results)) {
      throw new Error('Invalid data: results array is required');
    }
    
    if (parsed.players.length === 0) {
      throw new Error('Invalid data: at least one player is required');
    }
    
    // Validate players
    parsed.players.forEach((p: Player, index: number) => {
      if (!p.id || !p.name || !p.createdAt) {
        throw new Error(`Invalid player at index ${index}: id, name, and createdAt are required`);
      }
      if (typeof p.name !== 'string' || p.name.trim().length === 0) {
        throw new Error(`Invalid player at index ${index}: name must be a non-empty string`);
      }
    });
    
    // Validate results - handle both old and new formats
    parsed.results.forEach((r: Result, index: number) => {
      if (!r.id || !r.gameId || !r.timestamp) {
        throw new Error(`Invalid result at index ${index}: id, gameId, and timestamp are required`);
      }
      
      // Handle new format with positions
      if (r.positions && Array.isArray(r.positions)) {
        if (r.positions.length === 0) {
          throw new Error(`Invalid result at index ${index}: positions array cannot be empty`);
        }
        r.positions.forEach((pos: any, posIndex: number) => {
          if (!pos.playerId || typeof pos.position !== 'number' || typeof pos.points !== 'number') {
            throw new Error(`Invalid position at result ${index}, position ${posIndex}: playerId, position, and points are required`);
          }
        });
      }
    });
    
    return migrateState(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format: file is not valid JSON');
    }
    throw error;
  }
}

export function exportCSV(results: Result[]): string {
  if (results.length === 0) {
    return 'id,gameId,timestamp,isTwoPlayerDuel,positions,notes\n';
  }
  
  const headers = ['id', 'gameId', 'timestamp', 'isTwoPlayerDuel', 'positions', 'notes'];
  const rows = results.map(r => [
    r.id,
    r.gameId,
    r.timestamp,
    r.isTwoPlayerDuel ? 'true' : 'false',
    JSON.stringify(r.positions),
    r.notes || ''
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells that contain commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}