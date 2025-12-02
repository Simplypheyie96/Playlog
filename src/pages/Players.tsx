import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../lib/store';
import { calculatePlayerStats } from '../lib/ranking';
import { Avatar } from '../components/Avatar';
import { PointsChip } from '../components/PointsChip';
import { StreakPill } from '../components/StreakPill';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Trophy, Target, Percent, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner@2.0.3';
import { GAMES } from '../lib/types';

const AVATAR_EMOJIS = ['🙂', '😄', '😎', '🌸', '🕶️', '🎮', '🏆', '⭐', '🔥', '💎', '🎯', '🚀'];
const AVATAR_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4', '#F97316', '#14B8A6'];

export function Players() {
  const { players, results, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState('🙂');
  const [newPlayerColor, setNewPlayerColor] = useState('#6366F1');
  
  const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;
  
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    addPlayer({
      name: newPlayerName.trim(),
      avatar: newPlayerAvatar,
      color: newPlayerColor
    });
    
    toast.success('Player added!');
    setNewPlayerName('');
    setNewPlayerAvatar('🙂');
    setNewPlayerColor('#6366F1');
    setAddDialogOpen(false);
  };
  
  const handleEditPlayer = () => {
    if (!selectedPlayerId || !newPlayerName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    updatePlayer(selectedPlayerId, {
      name: newPlayerName.trim(),
      avatar: newPlayerAvatar,
      color: newPlayerColor
    });
    
    toast.success('Player updated!');
    setEditDialogOpen(false);
    setSelectedPlayerId(null);
  };
  
  const openEditDialog = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayerId(playerId);
      setNewPlayerName(player.name);
      setNewPlayerAvatar(player.avatar || '🙂');
      setNewPlayerColor(player.color || '#6366F1');
      setEditDialogOpen(true);
    }
  };
  
  const handleDeletePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player && confirm(`Are you sure you want to delete ${player.name}? This will also remove all their results.`)) {
      deletePlayer(playerId);
      toast.success('Player deleted');
    }
  };
  
  const toggleExpand = (playerId: string) => {
    setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-28">
        {/* Header */}
        <div
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-semibold">👥 Players</h1>
            <Button
              onClick={() => {
                setNewPlayerName('');
                setNewPlayerAvatar('🙂');
                setNewPlayerColor('#6366F1');
                setAddDialogOpen(true);
              }}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            View player stats and manage profiles
          </p>
        </div>
        
        {/* Players List */}
        <div className="space-y-3">
          {players.map((player, index) => {
            const stats = calculatePlayerStats(player.id, results);
            const isExpanded = expandedPlayerId === player.id;
            
            console.log(`👤 Rendering player card for ${player.name} (ID: ${player.id}):`, {
              gamesPlayed: stats.gamesPlayed,
              totalWins: stats.totalWins,
              totalPoints: stats.totalPoints
            });
            
            return (
              <div
                key={player.id}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Compact View */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer glass-hover transition-colors"
                  onClick={() => toggleExpand(player.id)}
                >
                  <Avatar player={player} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{player.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <PointsChip points={stats.totalPoints} />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="w-3 h-3" />
                        <span>{stats.totalWins}</span>
                      </div>
                      {stats.currentStreak > 0 && <StreakPill streak={stats.currentStreak} type="current" />}
                    </div>
                  </div>
                  
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="glass rounded-xl p-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Trophy className="w-4 h-4" />
                              <span className="text-xs">Total Wins</span>
                            </div>
                            <div className="text-lg font-semibold">{stats.totalWins}</div>
                          </div>
                          
                          <div className="glass rounded-xl p-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Target className="w-4 h-4" />
                              <span className="text-xs">Games Played</span>
                            </div>
                            <div className="text-lg font-semibold">{stats.gamesPlayed}</div>
                          </div>
                          
                          <div className="glass rounded-xl p-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Percent className="w-4 h-4" />
                              <span className="text-xs">Win Rate</span>
                            </div>
                            <div className="text-lg font-semibold">{stats.winPercentage.toFixed(1)}%</div>
                          </div>
                          
                          <div className="glass rounded-xl p-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <span className="text-xs">Points</span>
                            </div>
                            <div className="text-lg font-semibold">{Math.round(stats.totalPoints)}</div>
                          </div>
                        </div>
                        
                        {/* Streaks */}
                        {(stats.currentStreak > 0 || stats.longestStreak > 0) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {stats.currentStreak > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>Current:</span>
                                <StreakPill streak={stats.currentStreak} type="current" />
                              </div>
                            )}
                            {stats.longestStreak > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>Best:</span>
                                <StreakPill streak={stats.longestStreak} type="longest" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Per-Game Breakdown */}
                        {Object.keys(stats.winsByGame).length > 0 && (
                          <div className="glass rounded-xl p-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                              <Gamepad2 className="w-4 h-4" />
                              <span className="text-xs font-medium">Performance by Game</span>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(GAMES).map(([gameId, game]) => {
                                const wins = stats.winsByGame[gameId as keyof typeof stats.winsByGame] || 0;
                                const played = stats.gamesByGame[gameId as keyof typeof stats.gamesByGame] || 0;
                                const points = stats.pointsByGame[gameId as keyof typeof stats.pointsByGame] || 0;
                                
                                if (played === 0) return null;
                                
                                const winRate = played > 0 ? (wins / played) * 100 : 0;
                                const isMostWon = stats.mostWonGame === gameId;
                                
                                return (
                                  <motion.div
                                    key={gameId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded-lg glass",
                                      isMostWon && "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">{game.emoji}</span>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{game.name}</span>
                                          {isMostWon && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                                              Best
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {wins} {wins === 1 ? 'win' : 'wins'} / {played} {played === 1 ? 'game' : 'games'} • {winRate.toFixed(0)}% win rate
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm font-bold text-[#0ea5e9]">
                                      {Math.round(points)} pts
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(player.id);
                            }}
                            className="flex-1 glass glass-hover"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlayer(player.id);
                            }}
                            className="flex-1 bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        {/* Add Player Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
              <DialogDescription>Create a new player profile</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="glass"
                />
              </div>
              
              <div>
                <Label>Avatar Emoji</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewPlayerAvatar(emoji)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-2xl transition-all glass',
                        newPlayerAvatar === emoji
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/20'
                          : 'border-border glass-hover'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Avatar Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewPlayerColor(color)}
                      className={cn(
                        'h-12 rounded-lg border-2 transition-all',
                        newPlayerColor === color
                          ? 'border-foreground scale-110'
                          : 'border-border'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAddDialogOpen(false)} 
                  className="flex-1 glass glass-hover"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPlayer} 
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                >
                  Add Player
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Player Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Edit Player</DialogTitle>
              <DialogDescription>Update player profile</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="glass"
                />
              </div>
              
              <div>
                <Label>Avatar Emoji</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewPlayerAvatar(emoji)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-2xl transition-all glass',
                        newPlayerAvatar === emoji
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/20'
                          : 'border-border glass-hover'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Avatar Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewPlayerColor(color)}
                      className={cn(
                        'h-12 rounded-lg border-2 transition-all',
                        newPlayerColor === color
                          ? 'border-foreground scale-110'
                          : 'border-border'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)} 
                  className="flex-1 glass glass-hover"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditPlayer} 
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}