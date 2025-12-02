import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Simple family password - can be changed via environment variable
const FAMILY_PASSWORD = Deno.env.get('FAMILY_PASSWORD') || 'family2024';

// Helper to verify password
function verifyPassword(password: string | null) {
  return password === FAMILY_PASSWORD;
}

// Health check
app.get('/make-server-bfe510d3/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================================================
// PLAYERS ROUTES
// =============================================================================

// Get all players
app.get('/make-server-bfe510d3/players', async (c) => {
  try {
    const players = await kv.get('family:players') || [];
    return c.json({ players });
  } catch (error) {
    console.log('Get players error:', error);
    return c.json({ error: 'Failed to fetch players' }, 500);
  }
});

// Update players
app.post('/make-server-bfe510d3/players', async (c) => {
  try {
    const { players } = await c.req.json();
    
    if (!Array.isArray(players)) {
      return c.json({ error: 'Players must be an array' }, 400);
    }
    
    await kv.set('family:players', players);
    return c.json({ success: true, players });
  } catch (error) {
    console.log('Update players error:', error);
    return c.json({ error: 'Failed to update players' }, 500);
  }
});

// =============================================================================
// RESULTS ROUTES
// =============================================================================

// Get all results
app.get('/make-server-bfe510d3/results', async (c) => {
  try {
    const results = await kv.get('family:results') || [];
    return c.json({ results });
  } catch (error) {
    console.log('Get results error:', error);
    return c.json({ error: 'Failed to fetch results' }, 500);
  }
});

// Add a result
app.post('/make-server-bfe510d3/results', async (c) => {
  try {
    const { result } = await c.req.json();
    
    if (!result || !result.id) {
      return c.json({ error: 'Invalid result data' }, 400);
    }
    
    const results = await kv.get('family:results') || [];
    results.push(result);
    
    await kv.set('family:results', results);
    return c.json({ success: true, result });
  } catch (error) {
    console.log('Add result error:', error);
    return c.json({ error: 'Failed to add result' }, 500);
  }
});

// Update a result
app.put('/make-server-bfe510d3/results/:id', async (c) => {
  try {
    const resultId = c.req.param('id');
    const { result } = await c.req.json();
    
    const results = await kv.get('family:results') || [];
    const index = results.findIndex((r: any) => r.id === resultId);
    
    if (index === -1) {
      return c.json({ error: 'Result not found' }, 404);
    }
    
    results[index] = result;
    await kv.set('family:results', results);
    
    return c.json({ success: true, result });
  } catch (error) {
    console.log('Update result error:', error);
    return c.json({ error: 'Failed to update result' }, 500);
  }
});

// Delete all results (must come before delete single result)
app.delete('/make-server-bfe510d3/results/all', async (c) => {
  try {
    await kv.set('family:results', []);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete all results error:', error);
    return c.json({ error: 'Failed to delete all results' }, 500);
  }
});

// Delete a result
app.delete('/make-server-bfe510d3/results/:id', async (c) => {
  try {
    const resultId = c.req.param('id');
    
    const results = await kv.get('family:results') || [];
    const filteredResults = results.filter((r: any) => r.id !== resultId);
    
    await kv.set('family:results', filteredResults);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete result error:', error);
    return c.json({ error: 'Failed to delete result' }, 500);
  }
});

// =============================================================================
// SETTINGS ROUTES
// =============================================================================

// Get settings
app.get('/make-server-bfe510d3/settings', async (c) => {
  try {
    const settings = await kv.get('family:settings');
    return c.json({ settings });
  } catch (error) {
    console.log('Get settings error:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update settings
app.post('/make-server-bfe510d3/settings', async (c) => {
  try {
    const { settings } = await c.req.json();
    
    await kv.set('family:settings', settings);
    return c.json({ success: true, settings });
  } catch (error) {
    console.log('Update settings error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// =============================================================================
// SYNC ROUTE - Get all data at once
// =============================================================================

app.get('/make-server-bfe510d3/sync', async (c) => {
  try {
    const [players, results, settings] = await Promise.all([
      kv.get('family:players'),
      kv.get('family:results'),
      kv.get('family:settings')
    ]);
    
    return c.json({ 
      players: players || [],
      results: results || [],
      settings: settings || null
    });
  } catch (error) {
    console.log('Sync error:', error);
    return c.json({ error: 'Failed to sync data' }, 500);
  }
});

// =============================================================================
// INITIALIZE ROUTE - Set up initial data if needed
// =============================================================================

app.post('/make-server-bfe510d3/initialize', async (c) => {
  try {
    const existingPlayers = await kv.get('family:players');
    
    // Only initialize if no data exists
    if (!existingPlayers || existingPlayers.length === 0) {
      const defaultPlayers = [
        { id: '1', name: 'Player 1', avatar: '👤', color: 'indigo', joinedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: '2', name: 'Player 2', avatar: '👥', color: 'pink', joinedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: '3', name: 'Player 3', avatar: '🎮', color: 'purple', joinedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: '4', name: 'Player 4', avatar: '🏆', color: 'blue', joinedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: '5', name: 'Player 5', avatar: '⭐', color: 'emerald', joinedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
      ];
      
      await kv.set('family:players', defaultPlayers);
      await kv.set('family:results', []);
      
      return c.json({ success: true, initialized: true });
    }
    
    return c.json({ success: true, initialized: false, message: 'Data already exists' });
  } catch (error) {
    console.log('Initialize error:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// =============================================================================
// COMPLETE RESET ROUTE - Wipe all data for fresh start
// =============================================================================

app.post('/make-server-bfe510d3/reset-everything', async (c) => {
  try {
    // Delete all data
    await kv.del('family:players');
    await kv.del('family:results');
    await kv.del('family:settings');
    
    console.log('All data wiped successfully');
    return c.json({ success: true, message: 'All data has been wiped' });
  } catch (error) {
    console.log('Reset everything error:', error);
    return c.json({ error: 'Failed to reset all data' }, 500);
  }
});

Deno.serve(app.fetch);