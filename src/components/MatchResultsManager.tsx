
import React, { useState } from 'react';
import { Team, Fixture } from '@/types/football';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MatchResultsManagerProps {
  fixtures: Fixture[];
  teams: Team[];
  onFixturesUpdate: (fixtures: Fixture[]) => void;
}

export const MatchResultsManager: React.FC<MatchResultsManagerProps> = ({
  fixtures,
  teams,
  onFixturesUpdate,
}) => {
  const [selectedMatchweek, setSelectedMatchweek] = useState<number>(1);
  const [editingResults, setEditingResults] = useState<Record<string, { homeScore: string; awayScore: string }>>({});

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  const matchweeks = Array.from(new Set(fixtures.map(f => f.matchweek))).sort((a, b) => a - b);
  const currentMatchweekFixtures = fixtures.filter(f => f.matchweek === selectedMatchweek);

  const handleScoreChange = (fixtureId: string, field: 'homeScore' | 'awayScore', value: string) => {
    setEditingResults(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [field]: value,
      }
    }));
  };

  const saveResult = (fixtureId: string) => {
    const scores = editingResults[fixtureId];
    if (!scores) return;

    const homeScore = parseInt(scores.homeScore);
    const awayScore = parseInt(scores.awayScore);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      alert('Please enter valid scores');
      return;
    }

    const updatedFixtures = fixtures.map(fixture => {
      if (fixture.id === fixtureId) {
        return {
          ...fixture,
          homeScore,
          awayScore,
          played: true,
        };
      }
      return fixture;
    });

    onFixturesUpdate(updatedFixtures);
    
    // Clear editing state
    setEditingResults(prev => {
      const updated = { ...prev };
      delete updated[fixtureId];
      return updated;
    });
  };

  const clearResult = (fixtureId: string) => {
    const updatedFixtures = fixtures.map(fixture => {
      if (fixture.id === fixtureId) {
        return {
          ...fixture,
          homeScore: undefined,
          awayScore: undefined,
          played: false,
        };
      }
      return fixture;
    });

    onFixturesUpdate(updatedFixtures);
  };

  const startEditing = (fixture: Fixture) => {
    setEditingResults(prev => ({
      ...prev,
      [fixture.id]: {
        homeScore: fixture.homeScore?.toString() || '',
        awayScore: fixture.awayScore?.toString() || '',
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
      <Card>
        <CardHeader>
          <CardTitle>Matchweek {selectedMatchweek} Results</CardTitle>
          <CardDescription>Enter or update match results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead className="text-center">Home Score</TableHead>
                <TableHead className="text-center">Away Score</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMatchweekFixtures.map((fixture) => {
                const isEditing = editingResults[fixture.id];
                const homeTeam = getTeamName(fixture.homeTeamId);
                const awayTeam = getTeamName(fixture.awayTeamId);

                return (
                  <TableRow key={fixture.id}>
                    <TableCell className="font-medium">
                      {homeTeam} vs {awayTeam}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={isEditing.homeScore}
                          onChange={(e) => handleScoreChange(fixture.id, 'homeScore', e.target.value)}
                          className="w-16 text-center"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {fixture.homeScore !== undefined ? fixture.homeScore : '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={isEditing.awayScore}
                          onChange={(e) => handleScoreChange(fixture.id, 'awayScore', e.target.value)}
                          className="w-16 text-center"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {fixture.awayScore !== undefined ? fixture.awayScore : '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={fixture.played ? 'default' : 'secondary'}>
                        {fixture.played ? 'Played' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => saveResult(fixture.id)}>
                              Save
                            </Button>
                            <Button
                              size="sm"
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
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(fixture)}
                            >
                              {fixture.played ? 'Edit' : 'Add Result'}
                            </Button>
                            {fixture.played && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => clearResult(fixture.id)}
                              >
                                Clear
                              </Button>
                            )}
                          </>
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
    </div>
  );
};
