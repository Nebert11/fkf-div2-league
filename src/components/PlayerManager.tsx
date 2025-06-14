
import React, { useState } from 'react';
import { Team, Player, PlayerStats } from '@/types/football';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PlayerManagerProps {
  players: Player[];
  teams: Team[];
  onPlayersUpdate: (players: Player[]) => void;
  playerStats: PlayerStats[];
  onPlayerStatsUpdate: (stats: PlayerStats[]) => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  teams,
  onPlayersUpdate,
  playerStats,
  onPlayerStatsUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'stats'>('players');
  const [newPlayer, setNewPlayer] = useState({ name: '', teamId: '', position: '' });
  const [editingStats, setEditingStats] = useState<Record<string, Partial<PlayerStats>>>({});

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  const addPlayer = () => {
    if (!newPlayer.name.trim() || !newPlayer.teamId || !newPlayer.position) {
      alert('Please fill in all fields');
      return;
    }

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      teamId: newPlayer.teamId,
      position: newPlayer.position,
      createdAt: new Date(),
    };

    const stats: PlayerStats = {
      playerId: player.id,
      playerName: player.name,
      teamName: getTeamName(player.teamId),
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      appearances: 0,
    };

    onPlayersUpdate([...players, player]);
    onPlayerStatsUpdate([...playerStats, stats]);
    setNewPlayer({ name: '', teamId: '', position: '' });
  };

  const deletePlayer = (playerId: string) => {
    onPlayersUpdate(players.filter(p => p.id !== playerId));
    onPlayerStatsUpdate(playerStats.filter(s => s.playerId !== playerId));
  };

  const updatePlayerStats = (playerId: string, field: keyof PlayerStats, value: number) => {
    setEditingStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      }
    }));
  };

  const savePlayerStats = (playerId: string) => {
    const updates = editingStats[playerId];
    if (!updates) return;

    const updatedStats = playerStats.map(stat => {
      if (stat.playerId === playerId) {
        return { ...stat, ...updates };
      }
      return stat;
    });

    onPlayerStatsUpdate(updatedStats);
    setEditingStats(prev => {
      const updated = { ...prev };
      delete updated[playerId];
      return updated;
    });
  };

  const startEditingStats = (stats: PlayerStats) => {
    setEditingStats(prev => ({
      ...prev,
      [stats.playerId]: { ...stats }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          onClick={() => setActiveTab('players')}
          variant={activeTab === 'players' ? 'default' : 'outline'}
        >
          👥 Manage Players
        </Button>
        <Button
          onClick={() => setActiveTab('stats')}
          variant={activeTab === 'stats' ? 'default' : 'outline'}
        >
          📊 Player Statistics
        </Button>
      </div>

      {activeTab === 'players' && (
        <>
          {/* Add Player Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Player</CardTitle>
              <CardDescription>Add players to track their statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Player Name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newPlayer.teamId} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, teamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addPlayer}>Add Player</Button>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Players ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{getTeamName(player.teamId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePlayer(player.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'stats' && (
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
            <CardDescription>Update individual player performance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Clean Sheets</TableHead>
                  <TableHead className="text-center">Appearances</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map(stats => {
                  const isEditing = editingStats[stats.playerId];
                  
                  return (
                    <TableRow key={stats.playerId}>
                      <TableCell className="font-medium">{stats.playerName}</TableCell>
                      <TableCell>{stats.teamName}</TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            value={isEditing.goals || 0}
                            onChange={(e) => updatePlayerStats(stats.playerId, 'goals', parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                        ) : (
                          stats.goals
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            value={isEditing.assists || 0}
                            onChange={(e) => updatePlayerStats(stats.playerId, 'assists', parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                        ) : (
                          stats.assists
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            value={isEditing.cleanSheets || 0}
                            onChange={(e) => updatePlayerStats(stats.playerId, 'cleanSheets', parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                        ) : (
                          stats.cleanSheets
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            value={isEditing.appearances || 0}
                            onChange={(e) => updatePlayerStats(stats.playerId, 'appearances', parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                        ) : (
                          stats.appearances
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={() => savePlayerStats(stats.playerId)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingStats(prev => {
                                    const updated = { ...prev };
                                    delete updated[stats.playerId];
                                    return updated;
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingStats(stats)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
