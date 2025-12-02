import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Download, Upload, RotateCcw, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../lib/utils';
import { resetEverythingAPI } from '../lib/api';

export function Settings() {
  const { settings, updateSettings, exportState, importState, resetState, setAccess, clearAllResults } = useStore();
  const [isWiping, setIsWiping] = useState(false);
  
  const handleExport = () => {
    const state = exportState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };
  
  const handleImport = async (mode: 'replace' | 'merge') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Basic validation
        if (!data.players || !data.results || !data.settings) {
          throw new Error('Invalid data format');
        }
        
        importState(data, mode);
        toast.success(`Data ${mode === 'replace' ? 'replaced' : 'merged'} successfully`);
      } catch (error) {
        toast.error('Failed to import data: ' + (error as Error).message);
      }
    };
    
    input.click();
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetState();
      toast.success('All data has been reset');
    }
  };
  
  const handleClearResults = async () => {
    if (confirm('⚠️ Clear ALL game results? This will delete all games but keep player profiles. This cannot be undone.')) {
      try {
        await clearAllResults();
        toast.success('All game results have been cleared');
      } catch (error) {
        toast.error('Failed to clear results: ' + (error as Error).message);
      }
    }
  };
  
  const handleWipeEverything = async () => {
    if (confirm('⚠️⚠️⚠️ WIPE EVERYTHING FROM DATABASE? ⚠️⚠️⚠️\n\nThis will permanently delete:\n• All players\n• All game results\n• All settings\n• Everything from the database\n\nThis CANNOT be undone!\n\nClick OK to proceed.')) {
      setIsWiping(true);
      try {
        await resetEverythingAPI.run();
        toast.success('✅ Database wiped! Refresh the page to start fresh.');
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        toast.error('Failed to wipe data: ' + (error as Error).message);
        setIsWiping(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-28">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-1">⚙️ Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your app preferences and data
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-xl mb-4">🎨 Appearance</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use smaller spacing and sizes</p>
                </div>
                <Switch
                  id="compact"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-xl mb-4">Notifications</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Show toast notifications for actions</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSettings({ notifications: checked })}
              />
            </div>
          </motion.div>
          
          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-xl mb-4">📁 Data Management</h2>
            
            <div className="space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full justify-start glass glass-hover"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data (JSON)
              </Button>
              
              <Button
                onClick={() => handleImport('replace')}
                variant="outline"
                className="w-full justify-start glass glass-hover"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import & Replace Data
              </Button>
              
              <Button
                onClick={() => handleImport('merge')}
                variant="outline"
                className="w-full justify-start glass glass-hover"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import & Merge Data
              </Button>
              
              {/* Admin-only buttons - hidden from family members */}
              {/* 
              <Button
                onClick={handleClearResults}
                variant="outline"
                className="w-full justify-start bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Game Results
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
              
              <Button
                onClick={handleWipeEverything}
                variant="outline"
                className="w-full justify-start bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                disabled={isWiping}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Wipe Everything
              </Button>
              */}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}