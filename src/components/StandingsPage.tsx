
import React, { useState, useMemo } from 'react';
import { Team, Fixture, TeamStanding, Player, PlayerStats } from '@/types/football';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedMatchResultsManager } from './EnhancedMatchResultsManager';
import { PlayerManager } from './PlayerManager';
import { Download } from 'lucide-react';

interface StandingsPageProps {
  teams: Team[];
  fixtures: Fixture[];
  onFixturesUpdate: (fixtures: Fixture[]) => void;
  zoneName?: string;
}

export const StandingsPage: React.FC<StandingsPageProps> = ({
  teams,
  fixtures,
  onFixturesUpdate,
  zoneName = 'Zone',
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'table' | 'players' | 'stats'>('table');
  const [players, setPlayers] = useState<Player[]>([]);

  // Calculate player stats from fixture goals
  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();
    
    // Initialize stats for all players
    players.forEach(player => {
      const team = teams.find(t => t.id === player.teamId);
      statsMap.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        teamName: team?.name || 'Unknown',
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        appearances: 0,
      });
    });

    // Calculate goals from fixtures
    fixtures.forEach(fixture => {
      if (fixture.goals) {
        fixture.goals.forEach(goal => {
          const stat = statsMap.get(goal.playerId);
          if (stat) {
            stat.goals++;
          }
        });
      }
    });

    return Array.from(statsMap.values());
  }, [players, fixtures, teams]);

  // Calculate team standings
  const standings = useMemo(() => {
    const standingsMap = new Map<string, TeamStanding>();
    
    // Initialize standings for all teams
    teams.forEach(team => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: 0,
      });
    });

    // Process played fixtures
    fixtures.filter(fixture => fixture.played && fixture.homeScore !== undefined && fixture.awayScore !== undefined)
      .forEach(fixture => {
        const homeTeam = standingsMap.get(fixture.homeTeamId);
        const awayTeam = standingsMap.get(fixture.awayTeamId);
        
        if (homeTeam && awayTeam) {
          homeTeam.played++;
          awayTeam.played++;
          
          homeTeam.goalsFor += fixture.homeScore!;
          homeTeam.goalsAgainst += fixture.awayScore!;
          awayTeam.goalsFor += fixture.awayScore!;
          awayTeam.goalsAgainst += fixture.homeScore!;
          
          if (fixture.homeScore! > fixture.awayScore!) {
            homeTeam.won++;
            homeTeam.points += 3;
            awayTeam.lost++;
          } else if (fixture.homeScore! < fixture.awayScore!) {
            awayTeam.won++;
            awayTeam.points += 3;
            homeTeam.lost++;
          } else {
            homeTeam.drawn++;
            awayTeam.drawn++;
            homeTeam.points += 1;
            awayTeam.points += 1;
          }
          
          homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
          awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
        }
      });

    // Sort standings and assign positions
    const sortedStandings = Array.from(standingsMap.values())
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      })
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));

    return sortedStandings;
  }, [teams, fixtures]);

  // Get top scorers
  const topScorers = useMemo(() => {
    return playerStats
      .filter(stat => stat.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [playerStats]);

  const getPositionBadgeColor = (position: number) => {
    if (position <= 4) return 'bg-green-500';
    if (position <= 6) return 'bg-blue-500';
    if (position >= teams.length - 2) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const downloadPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>FKF Division 2 League - ${zoneName} Standings</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #16a34a; font-size: 24px; font-weight: bold; }
            .subtitle { color: #666; font-size: 18px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
            th { background-color: #16a34a; color: white; }
            .position { font-weight: bold; }
            .team-name { text-align: left; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            .date { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">⚽ FKF Division 2 League</div>
            <div class="subtitle">${zoneName} - League Table</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Team</th>
                <th>Played</th>
                <th>Won</th>
                <th>Drawn</th>
                <th>Lost</th>
                <th>Goals For</th>
                <th>Goals Against</th>
                <th>Goal Difference</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              ${standings.map(team => `
                <tr>
                  <td class="position">${team.position}</td>
                  <td class="team-name">${team.teamName}</td>
                  <td>${team.played}</td>
                  <td>${team.won}</td>
                  <td>${team.drawn}</td>
                  <td>${team.lost}</td>
                  <td>${team.goalsFor}</td>
                  <td>${team.goalsAgainst}</td>
                  <td class="${team.goalDifference >= 0 ? 'positive' : 'negative'}">
                    ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}
                  </td>
                  <td class="position">${team.points}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FKF-Division-2-${zoneName}-Standings.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveTab('table')}
            variant={activeTab === 'table' ? 'default' : 'outline'}
            className="flex-1"
          >
            🏆 League Table
          </Button>
          <Button
            onClick={() => setActiveTab('results')}
            variant={activeTab === 'results' ? 'default' : 'outline'}
            className="flex-1"
          >
            ⚽ Match Results
          </Button>
          <Button
            onClick={() => setActiveTab('players')}
            variant={activeTab === 'players' ? 'default' : 'outline'}
            className="flex-1"
          >
            👥 Players
          </Button>
          <Button
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex-1"
          >
            📊 Statistics
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'table' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  🏆 League Table
                </CardTitle>
                <CardDescription>
                  Current standings based on match results
                </CardDescription>
              </div>
              {standings.length > 0 && (
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download size={16} />
                  Download PDF
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">GF</TableHead>
                  <TableHead className="text-center">GA</TableHead>
                  <TableHead className="text-center">GD</TableHead>
                  <TableHead className="text-center font-bold">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team) => (
                  <TableRow key={team.teamId}>
                    <TableCell>
                      <Badge className={`${getPositionBadgeColor(team.position)} text-white`}>
                        {team.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{team.teamName}</TableCell>
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center">{team.won}</TableCell>
                    <TableCell className="text-center">{team.drawn}</TableCell>
                    <TableCell className="text-center">{team.lost}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-center">
                      <span className={team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold">{team.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'results' && (
        <EnhancedMatchResultsManager
          fixtures={fixtures}
          teams={teams}
          players={players}
          onFixturesUpdate={onFixturesUpdate}
        />
      )}

      {activeTab === 'players' && (
        <PlayerManager
          players={players}
          teams={teams}
          onPlayersUpdate={setPlayers}
          playerStats={playerStats}
          onPlayerStatsUpdate={() => {}}
        />
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Scorers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚽ Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Goals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScorers.length > 0 ? topScorers.map((player, index) => (
                    <TableRow key={player.playerId}>
                      <TableCell className="font-medium">{player.playerName}</TableCell>
                      <TableCell>{player.teamName}</TableCell>
                      <TableCell className="text-center font-bold">{player.goals}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No goals recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Season Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 Season Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Matches:</span>
                  <span className="font-bold">{fixtures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Matches Played:</span>
                  <span className="font-bold">{fixtures.filter(f => f.played).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Goals:</span>
                  <span className="font-bold">
                    {fixtures.reduce((sum, f) => sum + (f.goals?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Teams:</span>
                  <span className="font-bold">{teams.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
