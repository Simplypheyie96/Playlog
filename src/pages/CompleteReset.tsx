import { useState } from 'react';
import { Button } from '../components/ui/button';
import { resetEverythingAPI } from '../lib/api';
import { AlertTriangle } from 'lucide-react';

export function CompleteReset() {
  const [isResetting, setIsResetting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleCompleteReset = async () => {
    const confirmText = 'DELETE EVERYTHING';
    const userInput = prompt(
      `⚠️ COMPLETE DATABASE WIPE ⚠️\n\nThis will permanently delete:\n• All players\n• All game results\n• All settings\n• Everything from the database\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      alert('Reset cancelled - confirmation text did not match');
      return;
    }

    try {
      setIsResetting(true);
      await resetEverythingAPI.run();
      setIsComplete(true);
      alert('✅ All data has been completely wiped from the database!\n\nRefresh the page to start with a fresh app.');
    } catch (error) {
      alert('Error wiping data: ' + (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl mb-4">Database Wiped Successfully</h1>
          <p className="text-muted-foreground mb-6">
            All data has been permanently deleted from the database.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Refresh & Start Fresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl text-center mb-4">Complete Database Reset</h1>
        
        <div className="space-y-4 mb-6 text-sm text-muted-foreground">
          <p>This action will permanently delete:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All player profiles</li>
            <li>All game results and history</li>
            <li>All settings and preferences</li>
            <li>Everything from the Supabase database</li>
          </ul>
          <p className="text-red-500 font-semibold">
            ⚠️ THIS CANNOT BE UNDONE ⚠️
          </p>
        </div>

        <Button
          onClick={handleCompleteReset}
          disabled={isResetting}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          {isResetting ? 'Wiping Database...' : 'Wipe Entire Database'}
        </Button>
      </div>
    </div>
  );
}
