import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { rankPlayers, calculateGlobalStats, filterResultsByTime, TimeFilter } from '../lib/ranking';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { RecentActivity } from '../components/RecentActivity';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { RecordResultDialog } from '../components/RecordResultDialog';
import { EditResultDialog } from '../components/EditResultDialog';
import { Avatar } from '../components/Avatar';
import { StreakPill } from '../components/StreakPill';
import { Button } from '../components/ui/button';
import { GAMES, GameResult } from '../lib/types';
import { Trophy, Users, Gamepad2, Crown, ArrowRight, TrendingUp, Filter, Flame, Target, Zap, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../lib/utils';
import { checkBackupReminder } from '../lib/backup-reminder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export function Dashboard() {
  const { players, results, deleteResult } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GameResult | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  const filteredResults = filterResultsByTime(results, timeFilter);
  const rankedPlayers = rankPlayers(players, filteredResults);
  const globalStats = calculateGlobalStats(players, filteredResults);
  const hasDemoData = results.length > 0;
  
  const champion = rankedPlayers[0];
  const topThree = rankedPlayers.slice(0, 3);
  
  // Calculate game stats
  const gameStats = Object.entries(GAMES).map(([id, game]) => {
    const gameResults = filteredResults.filter(r => r.gameId === id);
    const totalGames = gameResults.length;
    const percentage = filteredResults.length > 0 ? (totalGames / filteredResults.length) * 100 : 0;
    return { id, game, totalGames, percentage };
  }).filter(s => s.totalGames > 0).sort((a, b) => b.totalGames - a.totalGames);
  
  // Find hottest streak
  const hottestStreak = rankedPlayers.reduce((max, p) => 
    p.currentStreak > max ? p.currentStreak : max, 0
  );
  
  const streakPlayer = rankedPlayers.find(p => p.currentStreak === hottestStreak);
  
  const timeFilterLabels = {
    all: '🏆 All Time',
    month: '📅 This Month',
    year: '📆 This Year'
  };
  
  useEffect(() => {
    checkBackupReminder();
  }, []);
  
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">
                Welcome to PlayLog 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your family's game wins and achievements
              </p>
            </div>
            
            {hasDemoData && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="glass glass-hover text-xs gap-1.5 h-8 px-2.5 transition-all"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{timeFilterLabels[timeFilter]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuItem 
                    onClick={() => setTimeFilter('all')}
                    className={cn(
                      "cursor-pointer text-sm",
                      timeFilter === 'all' && "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                    )}
                  >
                    🏆 All Time
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTimeFilter('month')}
                    className={cn(
                      "cursor-pointer text-sm",
                      timeFilter === 'month' && "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                    )}
                  >
                    📅 This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTimeFilter('year')}
                    className={cn(
                      "cursor-pointer text-sm",
                      timeFilter === 'year' && "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                    )}
                  >
                    📆 This Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* No Data State */}
        {!hasDemoData && (
          <div className="glass p-8 rounded-2xl mb-6 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-xl mb-2">Ready to Start Playing?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Log your first win and start your journey to glory!
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white hover:from-[#0ea5e9] hover:to-[#1e3a8a] shadow-lg shadow-[#0ea5e9]/20"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Record Result
            </Button>
          </div>
        )}
        
        {/* Stats Overview */}
        {hasDemoData && (
          <>
            {/* Podium - Top 3 */}
            {topThree.length > 0 && (
              <div className="relative overflow-hidden p-6 rounded-2xl mb-4 bg-[#192234] border border-[#2A3344]">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#0ea5e9]" />
                      <h3 className="font-semibold text-[#f1f5f9]">
                        Top Champions
                      </h3>
                    </div>
                    <div className="text-2xl">🏆</div>
                  </div>
                  
                  <div className="flex items-end justify-center gap-3 sm:gap-4">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-2">
                          <Avatar player={topThree[1].player} size="md" />
                          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#2A3344] border-2 border-[#0ea5e9] flex items-center justify-center text-xs font-bold text-[#0ea5e9]">
                            2
                          </div>
                        </div>
                        <div className="text-xs font-medium truncate w-full text-center mb-1 text-[#e2e8f0]">
                          {topThree[1].player.name}
                        </div>
                        <div className="w-full rounded-xl p-3 text-center transition-all cursor-pointer bg-[#2A3344] border border-[#0ea5e9]/30 hover:border-[#0ea5e9]/50">
                          <div className="text-lg font-bold text-[#f1f5f9]">{topThree[1].totalPoints}</div>
                          <div className="text-[10px] text-[#94a3b8]">points</div>
                        </div>
                      </div>
                    )}
                    
                    {/* 1st Place */}
                    {topThree[0] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-2">
                          <Avatar player={topThree[0].player} size="lg" />
                          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#1e40af] flex items-center justify-center font-bold shadow-2xl border-2 border-[#0ea5e9] text-white">
                            1
                          </div>
                        </div>
                        <div className="font-medium truncate w-full text-center mb-1 text-[#f1f5f9]">
                          {topThree[0].player.name}
                        </div>
                        <div className="w-full rounded-xl p-4 text-center transition-all cursor-pointer border-2 border-[#0ea5e9] bg-[#0ea5e9]/10 shadow-lg shadow-[#0ea5e9]/20 hover:shadow-xl hover:shadow-[#0ea5e9]/30">
                          <div className="text-2xl font-bold text-[#0ea5e9]">
                            {topThree[0].totalPoints}
                          </div>
                          <div className="text-[10px] text-[#e2e8f0]">points</div>
                        </div>
                      </div>
                    )}
                    
                    {/* 3rd Place */}
                    {topThree[2] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-2">
                          <Avatar player={topThree[2].player} size="md" />
                          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#2A3344] border-2 border-[#0ea5e9] flex items-center justify-center text-xs font-bold text-[#0ea5e9]">
                            3
                          </div>
                        </div>
                        <div className="text-xs font-medium truncate w-full text-center mb-1 text-[#e2e8f0]">
                          {topThree[2].player.name}
                        </div>
                        <div className="w-full rounded-xl p-3 text-center transition-all cursor-pointer bg-[#2A3344] border border-[#0ea5e9]/30 hover:border-[#0ea5e9]/50">
                          <div className="text-lg font-bold text-[#f1f5f9]">{topThree[2].totalPoints}</div>
                          <div className="text-[10px] text-[#94a3b8]">points</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="glass glass-hover p-4 rounded-xl transition-all cursor-pointer border-l-4 border-l-[#0ea5e9]">
                <div className="flex items-center gap-2 text-[#0ea5e9] mb-2">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-400">Total Games</span>
                </div>
                <div className="text-2xl font-bold text-[#f1f5f9]">{globalStats.totalGamesPlayed}</div>
              </div>
              
              <div className="glass glass-hover p-4 rounded-xl transition-all cursor-pointer border-l-4 border-l-[#EC4899]">
                <div className="flex items-center gap-2 text-[#EC4899] mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-400">Players</span>
                </div>
                <div className="text-2xl font-bold text-[#f1f5f9]">{globalStats.totalPlayers}</div>
              </div>
              
              <div className="glass glass-hover p-4 rounded-xl transition-all cursor-pointer border-l-4 border-l-[#10B981]">
                <div className="flex items-center gap-2 text-[#10B981] mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-400">Active 7d</span>
                </div>
                <div className="text-2xl font-bold text-[#f1f5f9]">{globalStats.activePlayersLast7Days}</div>
              </div>
              
              {hottestStreak > 0 && (
                <div className="glass glass-hover p-4 rounded-xl transition-all cursor-pointer border-l-4 border-l-[#F59E0B]">
                  <div className="flex items-center gap-2 text-[#F59E0B] mb-2">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-400">Hot Streak</span>
                  </div>
                  <div className="text-2xl font-bold text-[#f1f5f9]">{hottestStreak}</div>
                </div>
              )}
            </div>
            
            {/* Game Distribution */}
            {gameStats.length > 0 && (
              <div className="glass p-5 rounded-2xl mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0ea5e9]" />
                    <h3 className="text-sm font-semibold">Game Activity</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filteredResults.length} total
                  </div>
                </div>
                
                <div className="space-y-3">
                  {gameStats.map((stat, index) => {
                    const colors = [
                      { bar: 'bg-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10', text: 'text-[#0ea5e9]' },
                      { bar: 'bg-[#06B6D4]', bg: 'bg-[#06B6D4]/10', text: 'text-[#06B6D4]' },
                      { bar: 'bg-[#10B981]', bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={stat.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{stat.game.emoji}</span>
                            <span className="text-sm font-medium">{stat.game.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${color.text}`}>{stat.totalGames}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                              {stat.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${color.bar} transition-all duration-500`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Achievement Highlights */}
            {(champion || hottestStreak > 0) && (
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {champion && (
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-medium text-muted-foreground">Reigning Champion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar player={champion.player} size="sm" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{champion.player.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-bold">{champion.totalWins}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{champion.totalPoints} pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {streakPlayer && hottestStreak > 0 && (
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-muted-foreground">On Fire</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar player={streakPlayer.player} size="sm" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{streakPlayer.player.name}</div>
                        <div className="mt-1">
                          <StreakPill streak={hottestStreak} type="current" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Full Leaderboard */}
            {rankedPlayers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-3">Full Leaderboard</h3>
                <div className="space-y-2">
                  {rankedPlayers.slice(0, 5).map((rankedPlayer, index) => (
                    <LeaderboardCard
                      key={rankedPlayer.playerId}
                      rankedPlayer={rankedPlayer}
                      index={index}
                      animate={false}
                    />
                  ))}
                </div>
                
                {rankedPlayers.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-3 glass glass-hover text-xs h-9 transition-all"
                    onClick={() => window.location.hash = '#/players'}
                  >
                    View All Players ({rankedPlayers.length})
                  </Button>
                )}
              </div>
            )}
            
            {/* Recent Activity */}
            {results.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Matches</h3>
                
                <RecentActivity
                  results={results}
                  players={players}
                  limit={5}
                  onEdit={(result) => {
                    setSelectedResult(result);
                    setEditDialogOpen(true);
                  }}
                  onDelete={(resultId) => {
                    deleteResult(resultId);
                    toast.success('Result deleted');
                  }}
                />
                
                {results.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-3 glass glass-hover text-xs h-9 group transition-all"
                    onClick={() => window.location.hash = '#/activities'}
                  >
                    View All Activities ({results.length})
                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Quick Add */}
        <FloatingActionButton onClick={() => setDialogOpen(true)} />
        
        {/* Dialogs */}
        <RecordResultDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <EditResultDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} result={selectedResult} />
      </div>
    </div>
  );
}