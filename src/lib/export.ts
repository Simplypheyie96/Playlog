import { AppState, Result } from './types';

/**
 * Export app state as JSON
 */
export function exportAsJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Export results as CSV
 */
export function exportResultsAsCSV(results: Result[]): string {
  const headers = ['id', 'gameId', 'timestamp', 'isTwoPlayerDuel', 'positions', 'notes'];
  const rows = results.map(result => [
    result.id,
    result.gameId,
    result.timestamp,
    result.isTwoPlayerDuel ? 'true' : 'false',
    JSON.stringify(result.positions),
    result.notes || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells that contain commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Validate imported state
 */
export function validateImportedState(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }
  
  if (!Array.isArray(data.players)) {
    errors.push('Missing or invalid players array');
  } else {
    data.players.forEach((player: any, index: number) => {
      if (!player.id || !player.name || !player.createdAt) {
        errors.push(`Player at index ${index} is missing required fields (id, name, createdAt)`);
      }
    });
  }
  
  if (!Array.isArray(data.results)) {
    errors.push('Missing or invalid results array');
  } else {
    data.results.forEach((result: any, index: number) => {
      if (!result.id || !result.gameId || !result.timestamp || !Array.isArray(result.positions)) {
        errors.push(`Result at index ${index} is missing required fields`);
      }
    });
  }
  
  if (!data.settings || typeof data.settings !== 'object') {
    errors.push('Missing or invalid settings object');
  }
  
  if (typeof data.version !== 'number') {
    errors.push('Missing or invalid version number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
