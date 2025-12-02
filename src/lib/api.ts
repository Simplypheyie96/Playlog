import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Player, Result, Settings } from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-bfe510d3`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your internet connection');
    }
    throw error;
  }
}

// Players API
export const playersAPI = {
  async getAll(): Promise<{ players: Player[] }> {
    return fetchAPI('/players');
  },

  async update(players: Player[]): Promise<{ success: boolean; players: Player[] }> {
    return fetchAPI('/players', {
      method: 'POST',
      body: JSON.stringify({ players }),
    });
  },
};

// Results API
export const resultsAPI = {
  async getAll(): Promise<{ results: Result[] }> {
    return fetchAPI('/results');
  },

  async add(result: Result): Promise<{ success: boolean; result: Result }> {
    return fetchAPI('/results', {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  },

  async update(id: string, result: Result): Promise<{ success: boolean; result: Result }> {
    return fetchAPI(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ result }),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return fetchAPI(`/results/${id}`, {
      method: 'DELETE',
    });
  },
  
  async deleteAll(): Promise<{ success: boolean }> {
    return fetchAPI('/results/all', {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsAPI = {
  async get(): Promise<{ settings: Settings | null }> {
    return fetchAPI('/settings');
  },

  async update(settings: Settings): Promise<{ success: boolean; settings: Settings }> {
    return fetchAPI('/settings', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  },
};

// Sync API - get all data at once
export const syncAPI = {
  async getAll(): Promise<{ players: Player[]; results: Result[]; settings: Settings | null }> {
    return fetchAPI('/sync');
  },
};

// Initialize API - set up default data
export const initializeAPI = {
  async run(): Promise<{ success: boolean; initialized: boolean }> {
    return fetchAPI('/initialize', {
      method: 'POST',
    });
  },
};

// Reset Everything API - wipe all data
export const resetEverythingAPI = {
  async run(): Promise<{ success: boolean; message: string }> {
    return fetchAPI('/reset-everything', {
      method: 'POST',
    });
  },
};