import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar } from './Avatar';
import { PositionPicker } from './PositionPicker';
import { GAMES, GameResult } from '../lib/types';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { toast } from 'sonner@2.0.3';

interface EditResultDialogProps {
  result: GameResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditResultDialog({ result, open, onOpenChange }: EditResultDialogProps) {
  const { players, updateResult } = useStore();
  const [positions, setPositions] = useState<Array<{ playerId: string; position: number }>>([]);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (result) {
      setPositions(result.positions.map(p => ({ playerId: p.playerId, position: p.position })));
      setNotes(result.notes || '');
    }
  }, [result]);
  
  const toggleWinner = (playerId: string) => {
    if (positions.find(p => p.playerId === playerId)) {
      setPositions([]);
    } else {
      setPositions([{ playerId, position: 1 }]);
    }
  };
  
  const handleSubmit = () => {
    if (!result) return;
    
    if (positions.length === 0) {
      toast.error('Please select at least one player');
      return;
    }
    
    if (result.isTwoPlayerDuel && positions.length !== 1) {
      toast.error('Please select exactly one winner for 2-player duel');
      return;
    }
    
    updateResult(result.id, {
      positions: positions.map(p => ({ ...p, points: 0 })), // Points recalculated in store
      notes: notes.trim() || undefined
    });
    
    toast.success('Result updated!');
    handleClose();
  };
  
  const handleClose = () => {
    setPositions([]);
    setNotes('');
    onOpenChange(false);
  };
  
  if (!result) return null;
  
  const game = GAMES[result.gameId];
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#1A1F2E] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Result</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the result for {game.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>
              {result.isTwoPlayerDuel ? 'Select Winner' : 'Record Positions'}
            </Label>
            
            {result.isTwoPlayerDuel ? (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {players.map(player => {
                  const isSelected = positions.some(p => p.playerId === player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => toggleWinner(player.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all',
                        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]',
                        isSelected
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-border glass glass-hover'
                      )}
                    >
                      <Avatar player={player} size="sm" showName />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2">
                <PositionPicker
                  players={players}
                  selectedPlayers={positions}
                  onChange={setPositions}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Add any notes about this game..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}