export type GameId = 'ludo' | 'snakes' | 'chess';

export const GAMES: Record<GameId, { id: GameId; name: string; emoji: string; description: string }> = {
  ludo: {
    id: 'ludo',
    name: 'Ludo',
    emoji: '🎲',
    description: 'Classic board game of strategy and luck'
  },
  snakes: {
    id: 'snakes',
    name: 'Snakes & Ladders',
    emoji: '🐍',
    description: 'Climb the ladders, avoid the snakes'
  },
  chess: {
    id: 'chess',
    name: 'Chess',
    emoji: '♟️',
    description: 'The ultimate game of strategy and tactics'
  }
};

export type Position = number; // 1-based position, 1 is winner
export type TiePolicy = 'average' | 'highest' | 'lowest';
export type Theme = 'dark'; // Dark mode only

export interface Player {
  id: string;
  name: string;
  avatar?: string; // emoji or image URL
  color?: string;
  createdAt: string;
}

export interface PositionEntry {
  playerId: string;
  position: Position;
  points: number;
}

export interface Result {
  id: string;
  gameId: GameId;
  positions: PositionEntry[]; // ordered by position
  isTwoPlayerDuel?: boolean; // true for 2-player single-winner mode
  timestamp: string;
  notes?: string;
}

export interface Game {
  id: GameId;
  name: string;
  emoji: string;
  color: string;
}

export interface PointsTableTemplate {
  [playerCount: number]: {
    [position: number]: number;
  };
}

export interface Settings {
  theme: Theme;
  compactMode: boolean;
  reducedMotion: boolean;
  enabledGames: GameId[];
  pointsTable: PointsTableTemplate;
  tiePolicy: TiePolicy;
  notifications: boolean;
}

export interface AppState {
  players: Player[];
  results: Result[];
  settings: Settings;
  version: number;
}

// Default points table
export const DEFAULT_POINTS_TABLE: PointsTableTemplate = {
  2: { 1: 3, 2: 0 },
  3: { 1: 5, 2: 3, 3: 1 },
  4: { 1: 8, 2: 5, 3: 3, 4: 1 },
  5: { 1: 10, 2: 7, 3: 4, 4: 2, 5: 0 }
};

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Feyi', avatar: '🙂', color: '#7C5CFF', createdAt: '2025-11-12T00:00:00Z' },
  { id: 'p2', name: 'Joy', avatar: '😄', color: '#4DD0E1', createdAt: '2025-11-12T00:00:00Z' },
  { id: 'p3', name: 'Wura', avatar: '😎', color: '#FFD166', createdAt: '2025-11-12T00:00:00Z' },
  { id: 'p4', name: 'Mum', avatar: '🌸', color: '#FFB4C6', createdAt: '2025-11-12T00:00:00Z' },
  { id: 'p5', name: 'Dad', avatar: '🕶️', color: '#FF6B6B', createdAt: '2025-11-12T00:00:00Z' }
];