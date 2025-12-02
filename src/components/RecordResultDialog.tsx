import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../lib/store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { GAMES, Player } from '../lib/types';
import { Avatar } from './Avatar';
import { PositionPicker } from './PositionPicker';
import { cn } from '../lib/utils';
import { toast } from 'sonner@2.0.3';
import confetti from 'canvas-confetti';

interface RecordResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'game' | 'mode' | 'select-duel-players' | 'positions' | 'details';

export function RecordResultDialog({ open, onOpenChange }: RecordResultDialogProps) {
  const { players, settings, addResult } = useStore();
  const [step, setStep] = useState<Step>('game');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [isTwoPlayerDuel, setIsTwoPlayerDuel] = useState(false);
  const [duelPlayers, setDuelPlayers] = useState<string[]>([]);
  const [positions, setPositions] = useState<{ playerId: string; position: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure we always have enabled games - fallback to all games if settings not loaded
  const enabledGameIds = settings?.enabledGames && settings.enabledGames.length > 0 
    ? settings.enabledGames 
    : ['ludo', 'snakes', 'chess'];
    
  const enabledGames = Object.values(GAMES).filter(
    game => enabledGameIds.includes(game.id)
  );
  
  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    setStep('mode');
  };
  
  const handleModeSelect = (isDuel: boolean) => {
    setIsTwoPlayerDuel(isDuel);
    setPositions([]);
    console.log(`🎯 Mode selected: ${isDuel ? '2-PLAYER DUEL' : 'MULTIPLAYER'}`);
    setStep(isDuel ? 'select-duel-players' : 'positions');
  };
  
  const toggleWinner = (playerId: string) => {
    if (positions.find(p => p.playerId === playerId)) {
      console.log(`🏆 Winner deselected: ${playerId}`);
      setPositions([]);
    } else {
      const player = players.find(p => p.id === playerId);
      console.log(`🏆 Winner selected: ${player?.name} (ID: ${playerId})`);
      setPositions([{ playerId, position: 1 }]);
    }
  };
  
  const handleSubmit = async () => {
    if (positions.length === 0) {
      toast.error('Please select at least one player');
      return;
    }
    
    if (isTwoPlayerDuel && positions.length !== 1) {
      toast.error('Please select exactly one winner for 2-player duel');
      return;
    }
    
    if (!selectedGame) {
      toast.error('Please select a game');
      return;
    }
    
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      
      // For 2-player duels, add both players to positions (winner at 1, loser at 2)
      let finalPositions = positions;
      if (isTwoPlayerDuel && duelPlayers.length === 2) {
        const winnerId = positions[0].playerId;
        const loserId = duelPlayers.find(id => id !== winnerId);
        
        if (!loserId) {
          throw new Error('Invalid duel configuration');
        }
        
        finalPositions = [
          { playerId: winnerId, position: 1 },
          { playerId: loserId, position: 2 }
        ];
        
        console.log('🎯 Duel mode - Recording both players:', finalPositions);
      } else {
        console.log('🎯 Multiplayer mode - Recording all selected players:', finalPositions);
      }
      
      console.log('🔍 DETAILED POSITION DATA:');
      finalPositions.forEach((pos, index) => {
        const player = players.find(p => p.id === pos.playerId);
        console.log(`  [${index}] Position ${pos.position}: ${player?.name} (ID: ${pos.playerId})`);
      });
      
      // Validate all positions are sequential
      const sortedPositions = [...finalPositions].sort((a, b) => a.position - b.position);
      for (let i = 0; i < sortedPositions.length; i++) {
        if (sortedPositions[i].position !== i + 1) {
          throw new Error(`Invalid positions: expected position ${i + 1} but got ${sortedPositions[i].position}`);
        }
      }
      
      console.log(`🚀 About to call addResult with ${finalPositions.length} players`);
      
      const result = await addResult({
        gameId: selectedGame,
        positions: finalPositions.map(p => ({ ...p, points: 0 })), // Points calculated in store
        isTwoPlayerDuel,
        notes: notes.trim() || undefined
      });
      
      console.log('✅ Result saved successfully:', result);
      console.log('📋 Saved result contains', result.positions.length, 'players:');
      result.positions.forEach(pos => {
        const player = players.find(p => p.id === pos.playerId);
        console.log(`  - ${player?.name}: position ${pos.position}, points ${pos.points}`);
      });
      
      // Show confetti for first place
      if (!settings.reducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      const { deleteResult } = useStore.getState();
      
      const firstPlacePlayer = players.find(p => p.id === positions[0].playerId);
      
      toast.success('Result recorded!', {
        description: `${firstPlacePlayer?.name || 'Player'} ${isTwoPlayerDuel ? 'won' : 'came in 1st place'}!`,
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            deleteResult(result.id);
            toast.info('Result removed');
          }
        }
      });
      
      handleClose();
    } catch (error) {
      console.error('❌ Failed to add result:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save result';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setStep('game');
    setSelectedGame('');
    setIsTwoPlayerDuel(false);
    setDuelPlayers([]);
    setPositions([]);
    setNotes('');
    onOpenChange(false);
  };
  
  const canProceed = () => {
    if (step === 'positions') {
      if (isTwoPlayerDuel) {
        return positions.length === 1;
      }
      return positions.length >= 2;
    }
    return true;
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle>🎮 Log a Win</DialogTitle>
          <DialogDescription>Record a game result to update the leaderboard</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Step 1: Select Game */}
          {step === 'game' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Label>Select Game</Label>
              <div className="grid grid-cols-1 gap-3">
                {enabledGames.map(game => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleGameSelect(game.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      'glass glass-hover',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]',
                      'border-border hover:border-[#0ea5e9]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{game.emoji}</span>
                      <span className="font-medium">{game.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Select Mode */}
          {step === 'mode' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label>Select Match Type</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('game')}
                >
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleModeSelect(true)}
                  className="p-4 rounded-xl border-2 glass glass-hover border-border hover:border-[#0ea5e9] transition-all text-left"
                >
                  <div className="space-y-1">
                    <div className="font-medium">2-Player Duel</div>
                    <div className="text-sm text-muted-foreground">
                      Quick win - select one winner
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleModeSelect(false)}
                  className="p-4 rounded-xl border-2 glass glass-hover border-border hover:border-[#0ea5e9] transition-all text-left"
                >
                  <div className="space-y-1">
                    <div className="font-medium">Multiplayer Match</div>
                    <div className="text-sm text-muted-foreground">
                      Record positions for all players (2+)
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Select Duel Players */}
          {step === 'select-duel-players' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label>Select Duel Players</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('mode')}
                >
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {players.map(player => {
                  const isSelected = duelPlayers.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setDuelPlayers(duelPlayers.filter(id => id !== player.id));
                        } else {
                          setDuelPlayers([...duelPlayers, player.id]);
                        }
                      }}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all',
                        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
                        isSelected
                          ? 'border-green-500 bg-green-500/20 glass'
                          : 'border-border glass glass-hover'
                      )}
                    >
                      <Avatar player={player} size="sm" showName />
                    </button>
                  );
                })}
              </div>
              
              <Button
                type="button"
                onClick={() => {
                  setStep('positions');
                }}
                className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                disabled={duelPlayers.length !== 2}
              >
                Next: Select Winner
              </Button>
            </motion.div>
          )}
          
          {/* Step 4: Select Positions */}
          {step === 'positions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label>
                  {isTwoPlayerDuel ? 'Select Winner' : 'Record Positions'}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('mode')}
                >
                  Back
                </Button>
              </div>
              
              {isTwoPlayerDuel ? (
                <div className="grid grid-cols-1 gap-2">
                  {players.filter(p => duelPlayers.includes(p.id)).map(player => {
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
                            ? 'border-[#0ea5e9] bg-[#0ea5e9]/20 glass'
                            : 'border-border glass glass-hover'
                        )}
                      >
                        <Avatar player={player} size="sm" showName />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <PositionPicker
                  players={players}
                  selectedPlayers={positions}
                  onChange={setPositions}
                />
              )}
              
              <Button
                type="button"
                onClick={() => setStep('details')}
                className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                disabled={!canProceed()}
              >
                Continue
              </Button>
            </motion.div>
          )}
          
          {/* Step 5: Optional Details */}
          {step === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('positions')}
                >
                  Back
                </Button>
              </div>
              
              <Textarea
                id="notes"
                placeholder="Add any notes about this game..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="glass"
              />
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="flex-1 glass glass-hover"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                  disabled={isSubmitting}
                >
                  Save Result
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}