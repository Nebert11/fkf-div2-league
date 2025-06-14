
import React, { useState } from 'react';
import { Team, Fixture, Player, Goal } from '@/types/football';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface EnhancedMatchResultsManagerProps {
  fixtures: Fixture[];
  teams: Team[];
  players: Player[];
  onFixturesUpdate: (fixtures: Fixture[]) => void;
}

export const EnhancedMatchResultsManager: React.FC<EnhancedMatchResultsManagerProps> = ({
  fixtures,
  teams,
  players,
  onFixturesUpdate,
}) => {
  const [selectedMatchweek, setSelectedMatchweek] = useState<number>(1);
  const [editingResults, setEditingResults] = useState<Record<string, { 
    homeScore: string; 
    awayScore: string; 
    goals: Goal[];
  }>>({});

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  const getTeamPlayers = (teamId: string) => {
    return players.filter(player => player.teamId === teamId);
  };

  const matchweeks = Array.from(new Set(fixtures.map(f => f.matchweek))).sort((a, b) => a - b);
  const currentMatchweekFixtures = fixtures.filter(f => f.matchweek === selectedMatchweek);

  const handleScoreChange = (fixtureId: string, field: 'homeScore' | 'awayScore', value: string) => {
    setEditingResults(prev => ({
      ...prev,
      [fixtureId]: {
        homeScore: prev[fixtureId]?.homeScore || '',
        awayScore: prev[fixtureId]?.awayScore || '',
        goals: prev[fixtureId]?.goals || [],
        [field]: value,
      }
    }));
  };

  const addGoal = (fixtureId: string, teamId: string) => {
    setEditingResults(prev => {
      const current = prev[fixtureId] || { homeScore: '', awayScore: '', goals: [] };
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        fixtureId,
        playerId: '',
        playerName: '',
        teamId,
        minute: undefined
      };
      
      return {
        ...prev,
        [fixtureId]: {
          ...current,
          goals: [...current.goals, newGoal]
        }
      };
    });
  };

  const updateGoal = (fixtureId: string, goalId: string, field: keyof Goal, value: any) => {
    setEditingResults(prev => {
      const current = prev[fixtureId];
      if (!current) return prev;

      const updatedGoals = current.goals.map(goal => {
        if (goal.id === goalId) {
          const updatedGoal = { ...goal, [field]: value };
          if (field === 'playerId') {
            const player = players.find(p => p.id === value);
            updatedGoal.playerName = player?.name || '';
          }
          return updatedGoal;
        }
        return goal;
      });

      return {
        ...prev,
        [fixtureId]: {
          ...current,
          goals: updatedGoals
        }
      };
    });
  };

  const removeGoal = (fixtureId: string, goalId: string) => {
    setEditingResults(prev => {
      const current = prev[fixtureId];
      if (!current) return prev;

      return {
        ...prev,
        [fixtureId]: {
          ...current,
          goals: current.goals.filter(goal => goal.id !== goalId)
        }
      };
    });
  };

  const saveResult = (fixtureId: string) => {
    const result = editingResults[fixtureId];
    if (!result) return;

    const homeScore = parseInt(result.homeScore);
    const awayScore = parseInt(result.awayScore);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      alert('Please enter valid scores');
      return;
    }

    const totalGoals = result.goals.filter(g => g.playerId).length;
    const expectedGoals = homeScore + awayScore;

    if (totalGoals !== expectedGoals) {
      alert(`Number of goals (${totalGoals}) must match total score (${expectedGoals})`);
      return;
    }

    const updatedFixtures = fixtures.map(fixture => {
      if (fixture.id === fixtureId) {
        return {
          ...fixture,
          homeScore,
          awayScore,
          played: true,
          goals: result.goals.filter(g => g.playerId)
        };
      }
      return fixture;
    });

    onFixturesUpdate(updatedFixtures);
    
    setEditingResults(prev => {
      const updated = { ...prev };
      delete updated[fixtureId];
      return updated;
    });
  };

  const startEditing = (fixture: Fixture) => {
    setEditingResults(prev => ({
      ...prev,
      [fixture.id]: {
        homeScore: fixture.homeScore?.toString() || '',
        awayScore: fixture.awayScore?.toString() || '',
        goals: fixture.goals || []
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Matchweek Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Matchweek</CardTitle>
          <CardDescription>Choose a matchweek to manage results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {matchweeks.map(week => (
              <Button
                key={week}
                onClick={() => setSelectedMatchweek(week)}
                variant={selectedMatchweek === week ? 'default' : 'outline'}
                size="sm"
              >
                Week {week}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixtures for Selected Matchweek */}
      <div className="space-y-4">
        {currentMatchweekFixtures.map((fixture) => {
          const isEditing = editingResults[fixture.id];
          const homeTeam = getTeamName(fixture.homeTeamId);
          const awayTeam = getTeamName(fixture.awayTeamId);
          const homePlayers = getTeamPlayers(fixture.homeTeamId);
          const awayPlayers = getTeamPlayers(fixture.awayTeamId);

          return (
            <Card key={fixture.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {homeTeam} vs {awayTeam}
                  <Badge variant={fixture.played ? 'default' : 'secondary'} className="ml-2">
                    {fixture.played ? 'Played' : 'Pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Score Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <h4 className="font-medium mb-2">{homeTeam}</h4>
                        <Input
                          type="number"
                          min="0"
                          value={isEditing.homeScore}
                          onChange={(e) => handleScoreChange(fixture.id, 'homeScore', e.target.value)}
                          className="w-20 mx-auto text-center text-xl"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium mb-2">{awayTeam}</h4>
                        <Input
                          type="number"
                          min="0"
                          value={isEditing.awayScore}
                          onChange={(e) => handleScoreChange(fixture.id, 'awayScore', e.target.value)}
                          className="w-20 mx-auto text-center text-xl"
                        />
                      </div>
                    </div>

                    {/* Goals Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Goal Scorers</h4>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addGoal(fixture.id, fixture.homeTeamId)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {homeTeam} Goal
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addGoal(fixture.id, fixture.awayTeamId)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {awayTeam} Goal
                          </Button>
                        </div>
                      </div>

                      {isEditing.goals.length > 0 && (
                        <div className="space-y-2">
                          {isEditing.goals.map((goal) => {
                            const teamPlayers = goal.teamId === fixture.homeTeamId ? homePlayers : awayPlayers;
                            const teamName = goal.teamId === fixture.homeTeamId ? homeTeam : awayTeam;
                            
                            return (
                              <div key={goal.id} className="flex items-center gap-2 p-2 border rounded">
                                <span className="text-sm font-medium w-24">{teamName}:</span>
                                <Select
                                  value={goal.playerId}
                                  onValueChange={(value) => updateGoal(fixture.id, goal.id, 'playerId', value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select player" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamPlayers.map(player => (
                                      <SelectItem key={player.id} value={player.id}>
                                        {player.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  placeholder="Min"
                                  value={goal.minute || ''}
                                  onChange={(e) => updateGoal(fixture.id, goal.id, 'minute', parseInt(e.target.value) || undefined)}
                                  className="w-16"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeGoal(fixture.id, goal.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => saveResult(fixture.id)}>
                        Save Result
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingResults(prev => {
                            const updated = { ...prev };
                            delete updated[fixture.id];
                            return updated;
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Display Score */}
                    <div className="text-center">
                      <span className="text-3xl font-bold">
                        {fixture.homeScore !== undefined ? fixture.homeScore : '-'}
                        {' - '}
                        {fixture.awayScore !== undefined ? fixture.awayScore : '-'}
                      </span>
                    </div>

                    {/* Display Goals */}
                    {fixture.goals && fixture.goals.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Goal Scorers:</h4>
                        <div className="space-y-1">
                          {fixture.goals.map((goal) => (
                            <div key={goal.id} className="text-sm">
                              {goal.playerName} ({goal.teamId === fixture.homeTeamId ? homeTeam : awayTeam})
                              {goal.minute && ` - ${goal.minute}'`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => startEditing(fixture)}
                      >
                        {fixture.played ? 'Edit Result' : 'Add Result'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
