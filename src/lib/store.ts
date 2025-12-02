import { create } from 'zustand';
import { AppState, Player, Result, Settings, INITIAL_PLAYERS, DEFAULT_POINTS_TABLE } from './types';
import { assignPointsFromPositions, getPointsTableForPlayerCount } from './points';
import { playersAPI, resultsAPI, settingsAPI, syncAPI, initializeAPI } from './api';

const CURRENT_VERSION = 1;

interface StoreState extends AppState {
  // Access state
  hasAccess: boolean;
  isLoading: boolean;
  
  // Actions
  setAccess: (access: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  
  addResult: (result: Omit<Result, 'id' | 'timestamp'>) => Promise<Result>;
  updateResult: (id: string, updates: Partial<Omit<Result, 'id' | 'timestamp'>>) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  clearAllResults: () => Promise<void>;
  
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  
  syncFromServer: () => Promise<void>;
  initializeData: () => Promise<void>;
  
  importState: (state: Partial<AppState>, mode: 'replace' | 'merge') => void;
  exportState: () => AppState;
  resetState: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark', // Dark mode only
  compactMode: false,
  reducedMotion: false,
  enabledGames: ['ludo', 'snakes', 'chess'],
  pointsTable: DEFAULT_POINTS_TABLE,
  tiePolicy: 'average',
  notifications: true
};

const initialState: AppState = {
  players: INITIAL_PLAYERS,
  results: [],
  settings: defaultSettings,
  version: CURRENT_VERSION
};

export const useStore = create<StoreState>()((set, get) => ({
  ...initialState,
  hasAccess: false,
  isLoading: false,

  setAccess: (access) => {
    set({ hasAccess: access });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  initializeData: async () => {
    try {
      await initializeAPI.run();
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  },

  syncFromServer: async () => {
    try {
      set({ isLoading: true });
      const data = await syncAPI.getAll();
      
      // Migration is no longer needed - all new duels save both players correctly
      // Old data with single player in duel should be fixed or re-recorded
      const settings = data.settings || defaultSettings;
      
      set({
        players: data.players.length > 0 ? data.players : INITIAL_PLAYERS,
        results: data.results,
        settings: settings,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to sync from server:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  addPlayer: async (player) => {
    // Validate player data
    if (!player.name || typeof player.name !== 'string' || player.name.trim().length === 0) {
      const error = new Error('Player name is required');
      console.error('Failed to add player:', error);
      throw error;
    }
    
    if (player.name.trim().length > 50) {
      const error = new Error('Player name must be less than 50 characters');
      console.error('Failed to add player:', error);
      throw error;
    }
    
    const newPlayer: Player = {
      ...player,
      name: player.name.trim(),
      id: `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    const currentPlayers = get().players;
    const updatedPlayers = [...currentPlayers, newPlayer];
    
    try {
      await playersAPI.update(updatedPlayers);
      set({ players: updatedPlayers });
      return newPlayer;
    } catch (error) {
      console.error('Failed to add player:', error);
      throw error;
    }
  },

  updatePlayer: async (id, updates) => {
    const currentPlayers = get().players;
    const updatedPlayers = currentPlayers.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    
    try {
      await playersAPI.update(updatedPlayers);
      set({ players: updatedPlayers });
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    const state = get();
    const updatedPlayers = state.players.filter(p => p.id !== id);
    const updatedResults = state.results.filter(r =>
      !r.positions.some(pos => pos.playerId === id)
    );
    
    try {
      await playersAPI.update(updatedPlayers);
      // Delete results that include this player
      const deletedResults = state.results.filter(r =>
        r.positions.some(pos => pos.playerId === id)
      );
      
      for (const result of deletedResults) {
        await resultsAPI.delete(result.id);
      }
      
      set({ players: updatedPlayers, results: updatedResults });
    } catch (error) {
      console.error('Failed to delete player:', error);
      throw error;
    }
  },

  addResult: async (result) => {
    // Validate result data
    if (!result.gameId) {
      const error = new Error('Game selection is required');
      console.error('Failed to add result:', error);
      throw error;
    }
    
    if (!result.positions || !Array.isArray(result.positions) || result.positions.length === 0) {
      const error = new Error('At least one player is required');
      console.error('Failed to add result:', error);
      throw error;
    }
    
    // Validate all positions have valid player IDs
    const state = get();
    const validPlayerIds = new Set(state.players.map(p => p.id));
    for (const pos of result.positions) {
      if (!validPlayerIds.has(pos.playerId)) {
        const error = new Error(`Invalid player ID: ${pos.playerId}`);
        console.error('Failed to add result:', error);
        throw error;
      }
    }
    
    const playerCount = result.positions.length;
    const pointsTable = getPointsTableForPlayerCount(
      playerCount,
      state.settings.pointsTable
    );
    
    console.log('📊 Recording result:', {
      gameId: result.gameId,
      isTwoPlayerDuel: result.isTwoPlayerDuel,
      playerCount,
      positions: result.positions,
      pointsTable
    });
    
    const pointsMap = assignPointsFromPositions(
      result.positions,
      pointsTable,
      state.settings.tiePolicy
    );
    
    console.log('💰 Points assigned:', pointsMap);
    
    const newResult: Result = {
      ...result,
      id: `r${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      positions: result.positions.map(p => ({
        ...p,
        points: pointsMap[p.playerId] || 0
      }))
    };
    
    console.log('✅ Final result to save:', newResult);
    
    try {
      await resultsAPI.add(newResult);
      set(state => ({
        results: [...state.results, newResult]
      }));
      return newResult;
    } catch (error) {
      console.error('Failed to add result:', error);
      throw error;
    }
  },

  updateResult: async (id, updates) => {
    const state = get();
    
    const updatedResults = state.results.map(r => {
      if (r.id !== id) return r;
      
      const updatedResult = { ...r, ...updates };
      
      if (updates.positions) {
        const playerCount = updates.positions.length;
        const pointsTable = getPointsTableForPlayerCount(
          playerCount,
          state.settings.pointsTable
        );
        
        const pointsMap = assignPointsFromPositions(
          updates.positions,
          pointsTable,
          state.settings.tiePolicy
        );
        
        updatedResult.positions = updates.positions.map(p => ({
          ...p,
          points: pointsMap[p.playerId] || 0
        }));
      }
      
      return updatedResult;
    });
    
    const updatedResult = updatedResults.find(r => r.id === id);
    
    try {
      if (updatedResult) {
        await resultsAPI.update(id, updatedResult);
      }
      set({ results: updatedResults });
    } catch (error) {
      console.error('Failed to update result:', error);
      throw error;
    }
  },

  deleteResult: async (id) => {
    try {
      await resultsAPI.delete(id);
      set(state => ({
        results: state.results.filter(r => r.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete result:', error);
      throw error;
    }
  },

  clearAllResults: async () => {
    try {
      // Delete all results from the server
      await resultsAPI.deleteAll();
      // Clear results in the state
      set({ results: [] });
    } catch (error) {
      console.error('Failed to clear all results:', error);
      throw error;
    }
  },

  updateSettings: async (updates) => {
    const state = get();
    const updatedSettings = { ...state.settings, ...updates };
    
    try {
      await settingsAPI.update(updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  importState: (importedState, mode) => {
    const current = get();
    
    if (mode === 'replace') {
      set({
        players: importedState.players || current.players,
        results: importedState.results || current.results,
        settings: { ...current.settings, ...importedState.settings },
        version: importedState.version || current.version
      });
    } else {
      const playerMap = new Map(current.players.map(p => [p.id, p]));
      (importedState.players || []).forEach(p => {
        if (!playerMap.has(p.id)) {
          playerMap.set(p.id, p);
        }
      });
      
      const resultMap = new Map(current.results.map(r => [r.id, r]));
      (importedState.results || []).forEach(r => {
        if (!resultMap.has(r.id)) {
          resultMap.set(r.id, r);
        }
      });
      
      set({
        players: Array.from(playerMap.values()),
        results: Array.from(resultMap.values()),
        settings: { ...current.settings, ...importedState.settings }
      });
    }
  },

  exportState: () => {
    const state = get();
    return {
      players: state.players,
      results: state.results,
      settings: state.settings,
      version: state.version
    };
  },

  resetState: () => {
    set(initialState);
  }
}));