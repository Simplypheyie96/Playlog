import { useState } from 'react';
import { Edit2, Trophy, Target, Flame } from 'lucide-react';
import { Avatar } from '../Avatar';
import { RankBadge } from '../RankBadge';
import { StreakPill } from '../StreakPill';
import { StatCard } from '../StatCard';
import { ActivityFeed } from '../ActivityFeed';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useStore } from '../../lib/store';
import { rankPlayers, getPlayerStats } from '../../lib/utils';
import { GAMES } from '../../lib/types';

interface PlayersPageProps {
  selectedPlayerId?: string;
  onBack?: () => void;
}

export function PlayersPage({ selectedPlayerId, onBack }: PlayersPageProps) {
  const { players, results, updatePlayer } = useStore();
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editColor, setEditColor] = useState('');
  
  const rankedPlayers = rankPlayers(players, results);
  const selectedPlayer = selectedPlayerId
    ? players.find(p => p.id === selectedPlayerId)
    : null;
  
  const handleEdit = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setEditingPlayer(playerId);
      setEditName(player.name);
      setEditAvatar(player.avatar || '');
      setEditColor(player.color || '#6C5CE7');
    }
  };
  
  const handleSave = () => {
    if (editingPlayer) {
      updatePlayer(editingPlayer, {
        name: editName,
        avatar: editAvatar,
        color: editColor
      });
      setEditingPlayer(null);
    }
  };
  
  // If a player is selected, show their detail view
  if (selectedPlayer) {
    const stats = getPlayerStats(selectedPlayer, results, results.length);
    const rank = rankedPlayers.findIndex(r => r.id === selectedPlayer.id) + 1;
    const playerResults = results.filter(r => r.winners.includes(selectedPlayer.id));
    
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            ← Back to Players
          </Button>
        )}
        
        {/* Player Header */}
        <div className="bg-gradient-to-br from-card to-muted rounded-2xl p-6 border border-border">
          <div className="flex items-start gap-4">
            <Avatar player={selectedPlayer} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1>{selectedPlayer.name}</h1>
                <RankBadge rank={rank} size="md" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(selectedPlayer.id)}
                >
                  <Edit2 size={16} />
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-muted-foreground">
                  {stats.wins} total wins
                </span>
                {stats.currentStreak > 0 && (
                  <StreakPill streak={stats.currentStreak} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Wins"
            value={stats.wins}
            icon={Trophy}
            color="var(--color-game-ludo)"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winPercentage.toFixed(0)}%`}
            icon={Target}
            color="var(--color-success)"
          />
          <StatCard
            title="Current Streak"
            value={stats.currentStreak}
            icon={Flame}
            color="#FF6B6B"
          />
          <StatCard
            title="Best Streak"
            value={stats.longestStreak}
            icon={Flame}
            color="var(--color-accent-gold)"
          />
        </div>
        
        {/* Wins by Game */}
        <div>
          <h2 className="mb-4">Wins by Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.winsByGame).map(([gameId, wins]) => {
              const game = GAMES[gameId as keyof typeof GAMES];
              return (
                <div
                  key={gameId}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${game.color}20` }}
                    >
                      {game.emoji}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{game.name}</p>
                      <p className="text-xl">{wins}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Match History */}
        <div>
          <h2 className="mb-4">Match History</h2>
          <ActivityFeed
            results={playerResults}
            players={players}
            maxItems={10}
            showDelete
          />
        </div>
      </div>
    );
  }
  
  // Otherwise show all players list
  return (
    <div className="space-y-6">
      <div>
        <h1>Players</h1>
        <p className="text-muted-foreground mt-1">
          View and edit player profiles
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankedPlayers.map((entry, index) => {
          const player = players.find(p => p.id === entry.id)!;
          const stats = getPlayerStats(player, results, results.length);
          
          return (
            <div
              key={player.id}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar player={player} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate">{player.name}</h3>
                    <RankBadge rank={index + 1} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.wins} wins • {stats.winPercentage.toFixed(0)}% win rate
                  </p>
                  {stats.currentStreak > 0 && (
                    <StreakPill streak={stats.currentStreak} className="mt-2" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(player.id)}
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={editingPlayer !== null} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Player name"
              />
            </div>
            <div>
              <Label htmlFor="avatar">Avatar Emoji</Label>
              <Input
                id="avatar"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="🙂"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="color">Avatar Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#6C5CE7"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPlayer(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
