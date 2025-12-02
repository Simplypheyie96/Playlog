import { useState } from 'react';
import { Moon, Sun, Monitor, Download, Upload, Trash2, Play, Pause, Info, HardDrive } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useStore } from '../../lib/store';
import { exportJSON, exportCSV, importJSON } from '../../lib/persistence';
import { generateDemoData } from '../../lib/demo-data';
import { toast } from 'sonner@2.0.3';
import { GAMES } from '../../lib/types';
import { cn } from '../../lib/utils';
import { getStorageInfo, formatBytes } from '../../lib/offline';

export function SettingsPage() {
  const { settings, updateSettings, results, importState, resetState } = useStore();
  const [importing, setImporting] = useState(false);
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    
    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };
  
  const handleExportJSON = () => {
    try {
      const json = exportJSON(useStore.getState());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
      
      // Mark backup as completed
      const { markBackupCompleted } = require('../../lib/backup-reminder');
      markBackupCompleted();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };
  
  const handleExportCSV = () => {
    try {
      if (results.length === 0) {
        toast.error('No results to export');
        return;
      }
      const csv = exportCSV(results);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Results exported to CSV');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export CSV. Please try again.');
    }
  };
  
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }
      
      try {
        setImporting(true);
        const text = await file.text();
        const state = importJSON(text);
        importState(state, 'replace');
        toast.success('Data imported successfully');
      } catch (error) {
        console.error('Import failed:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to import data');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      try {
        resetState();
        toast.success('All data has been reset');
      } catch (error) {
        console.error('Reset failed:', error);
        toast.error('Failed to reset data. Please try again.');
      }
    }
  };
  
  const toggleGame = (gameId: 'chess') => {
    const enabledGames = settings.enabledGames.includes(gameId)
      ? settings.enabledGames.filter(g => g !== gameId)
      : [...settings.enabledGames, gameId];
    updateSettings({ enabledGames });
  };
  
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your leaderboard experience
        </p>
      </div>
      
      {/* Appearance */}
      <section className="space-y-4">
        <h2>Appearance</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <div>
            <Label className="mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  settings.theme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <Sun size={20} />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  settings.theme === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <Moon size={20} />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  settings.theme === 'system'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <Monitor size={20} />
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use smaller spacing</p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            />
          </div>
        </div>
      </section>
      
      {/* Games */}
      <section className="space-y-4">
        <h2>Games</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{GAMES.chess.emoji}</span>
                <Label htmlFor="enable-chess">Enable Chess</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Add Chess to your games list
              </p>
            </div>
            <Switch
              id="enable-chess"
              checked={settings.enabledGames.includes('chess')}
              onCheckedChange={() => toggleGame('chess')}
            />
          </div>
        </div>
      </section>
      
      {/* Notifications */}
      <section className="space-y-4">
        <h2>Notifications</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show toast notifications
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>
        </div>
      </section>
      
      {/* Data Management */}
      <section className="space-y-4">
        <h2>Data Management</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <div>
            <h3 className="mb-2">Export Data</h3>
            <div className="flex gap-2">
              <Button onClick={handleExportJSON} variant="outline" className="flex-1">
                <Download size={16} className="mr-2" />
                Export JSON
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="flex-1">
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="mb-2">Import Data</h3>
            <Button
              onClick={handleImportJSON}
              variant="outline"
              className="w-full"
              disabled={importing}
            >
              <Upload size={16} className="mr-2" />
              {importing ? 'Importing...' : 'Import JSON'}
            </Button>
          </div>
          
          <div className="pt-3 border-t border-border">
            <h3 className="mb-2 text-destructive">Danger Zone</h3>
            <Button onClick={handleReset} variant="destructive" className="w-full">
              <Trash2 size={16} className="mr-2" />
              Reset All Data
            </Button>
          </div>
        </div>
      </section>
      
      {/* About */}
      <section className="space-y-4">
        <h2>About</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            PlayLog v1.0
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Track your gaming victories
          </p>
        </div>
      </section>
      
      {/* Offline Storage */}
      <section className="space-y-4">
        <h2>Offline Storage</h2>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="offline-storage">Storage Info</Label>
              <p className="text-sm text-muted-foreground">
                Check your offline storage usage
              </p>
            </div>
            <Button
              id="offline-storage"
              onClick={async () => {
                const storageInfo = await getStorageInfo();
                toast.info(`Storage used: ${formatBytes(storageInfo.used)}, Total: ${formatBytes(storageInfo.total)}`);
              }}
              variant="outline"
            >
              <HardDrive size={16} className="mr-2" />
              Check Storage
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}