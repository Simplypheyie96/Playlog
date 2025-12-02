import { useState } from 'react';
import { useStore } from '../lib/store';
import { RecentActivity } from '../components/RecentActivity';
import { EditResultDialog } from '../components/EditResultDialog';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { RecordResultDialog } from '../components/RecordResultDialog';
import { GameResult, GAMES } from '../lib/types';
import { Button } from '../components/ui/button';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../lib/utils';

export function Activities() {
  const { players, results, deleteResult } = useStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GameResult | null>(null);
  const [filterGame, setFilterGame] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort results by date (newest first)
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Filter results
  const filteredResults = sortedResults.filter(result => {
    // Filter by game
    if (filterGame !== 'all' && result.gameId !== filterGame) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const game = GAMES[result.gameId];
      const winner = players.find(p => p.id === result.positions[0]?.playerId);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        game.name.toLowerCase().includes(searchLower) ||
        winner?.name.toLowerCase().includes(searchLower) ||
        result.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  const gameOptions = [
    { value: 'all', label: 'All Games', emoji: '🎮' },
    ...Object.entries(GAMES).map(([id, game]) => ({
      value: id,
      label: game.name,
      emoji: game.emoji
    }))
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-28">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-1">📊 Activity</h1>
          <p className="text-sm text-muted-foreground">
            View your complete game history
          </p>
        </div>
        
        {/* Filters */}
        <div
          className="glass rounded-2xl p-4 mb-6"
        >
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Game Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {gameOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterGame(option.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap text-xs sm:text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]',
                    'active:scale-95',
                    filterGame === option.value
                      ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                      : 'glass glass-hover'
                  )}
                >
                  <span className="text-base">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div
          className="mb-4"
        >
          <p className="text-sm text-muted-foreground">
            Showing {filteredResults.length} of {results.length} activities
          </p>
        </div>
        
        {/* Activities List */}
        {filteredResults.length > 0 ? (
          <div
          >
            <RecentActivity
              results={filteredResults}
              players={players}
              onEdit={(result) => {
                setSelectedResult(result);
                setEditDialogOpen(true);
              }}
              onDelete={(resultId) => {
                deleteResult(resultId);
                toast.success('Result deleted');
              }}
            />
          </div>
        ) : (
          <div
            className="glass rounded-2xl p-8 text-center bg-[#192234] border border-[#2A3344]"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterGame !== 'all'
                ? 'Try adjusting your filters'
                : 'Start logging games to see activity here'}
            </p>
          </div>
        )}
        
        {/* Quick Add */}
        <FloatingActionButton onClick={() => setAddDialogOpen(true)} />
        
        {/* Dialogs */}
        <RecordResultDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <EditResultDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
          result={selectedResult} 
        />
      </div>
    </div>
  );
}