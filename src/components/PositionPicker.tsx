import { useState } from 'react';
import { Player } from '../lib/types';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PositionPickerProps {
  players: Player[];
  selectedPlayers: Array<{ playerId: string; position: number }>;
  onChange: (selections: Array<{ playerId: string; position: number }>) => void;
}

export function PositionPicker({ players, selectedPlayers, onChange }: PositionPickerProps) {
  const [selections, setSelections] = useState<Array<{ playerId: string; position: number }>>(
    selectedPlayers
  );

  const togglePlayer = (playerId: string) => {
    const exists = selections.find(s => s.playerId === playerId);
    
    if (exists) {
      const newSelections = selections.filter(s => s.playerId !== playerId);
      console.log(`🎮 PositionPicker: Removed player ${playerId}. Now ${newSelections.length} players selected`);
      setSelections(newSelections);
      onChange(newSelections);
    } else {
      const maxPosition = selections.length > 0 
        ? Math.max(...selections.map(s => s.position))
        : 0;
      const newSelections = [...selections, { playerId, position: maxPosition + 1 }];
      console.log(`🎮 PositionPicker: Added player ${playerId} at position ${maxPosition + 1}. Now ${newSelections.length} players selected`);
      setSelections(newSelections);
      onChange(newSelections);
    }
  };

  const moveUp = (playerId: string) => {
    const index = selections.findIndex(s => s.playerId === playerId);
    if (index > 0) {
      const newSelections = [...selections];
      [newSelections[index - 1], newSelections[index]] = [newSelections[index], newSelections[index - 1]];
      
      // Update positions
      const updated = newSelections.map((s, idx) => ({ ...s, position: idx + 1 }));
      setSelections(updated);
      onChange(updated);
    }
  };

  const moveDown = (playerId: string) => {
    const index = selections.findIndex(s => s.playerId === playerId);
    if (index < selections.length - 1) {
      const newSelections = [...selections];
      [newSelections[index], newSelections[index + 1]] = [newSelections[index + 1], newSelections[index]];
      
      // Update positions
      const updated = newSelections.map((s, idx) => ({ ...s, position: idx + 1 }));
      setSelections(updated);
      onChange(updated);
    }
  };

  const getPlayerPosition = (playerId: string) => {
    return selections.find(s => s.playerId === playerId)?.position;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Available Players</h3>
        <div className="grid grid-cols-1 gap-2">
          {players
            .filter(p => !selections.find(s => s.playerId === p.id))
            .map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className="p-3 rounded-xl border-2 border-border hover:border-[#0ea5e9] transition-all text-left"
              >
                <Avatar player={player} size="sm" showName />
              </button>
            ))}
        </div>
      </div>

      {selections.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Positions (drag to reorder)</h3>
          <div className="space-y-2">
            {selections.map((selection, index) => {
              const player = players.find(p => p.id === selection.playerId);
              if (!player) return null;

              return (
                <div
                  key={selection.playerId}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#0ea5e9]/10 border-2 border-[#0ea5e9]/30"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(selection.playerId)}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(selection.playerId)}
                      disabled={index === selections.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold">
                        {selection.position}
                      </div>
                      <Avatar player={player} size="sm" showName />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlayer(selection.playerId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}