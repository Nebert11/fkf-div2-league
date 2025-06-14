import React, { useState } from 'react';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Team, Fixture } from '@/types/football';

interface FixtureGeneratorProps {
  teams: Team[];
  onFixturesGenerated: (fixtures: Fixture[]) => void;
}

export const FixtureGenerator: React.FC<FixtureGeneratorProps> = ({ teams, onFixturesGenerated }) => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7)
      .toISOString()
      .split('T')[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFixtures = () => {
    setIsGenerating(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const fixtures = generateRoundRobinFixtures(teams, new Date(startDate));
      onFixturesGenerated(fixtures);
      setIsGenerating(false);
    }, 1500);
  };

  const generateRoundRobinFixtures = (teams: Team[], startDate: Date): Fixture[] => {
    const fixtures: Fixture[] = [];
    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const numMatchesPerRound = numTeams / 2;
    
    // Create a copy of teams for manipulation
    const teamList = [...teams];
    
    // If odd number of teams, add a "bye" team
    if (numTeams % 2 === 1) {
      teamList.push({ id: 'bye', name: 'BYE', stadium: '', createdAt: new Date() });
    }
    
    const totalTeams = teamList.length;
    let matchweek = 1;
    let currentDate = new Date(startDate);

    // Generate first half of season (each team plays each other once)
    for (let round = 0; round < numRounds; round++) {
      const roundFixtures: Fixture[] = [];
      
      for (let match = 0; match < totalTeams / 2; match++) {
        const homeIndex = match;
        const awayIndex = totalTeams - 1 - match;
        
        const homeTeam = teamList[homeIndex];
        const awayTeam = teamList[awayIndex];
        
        // Skip matches involving the bye team
        if (homeTeam.id !== 'bye' && awayTeam.id !== 'bye') {
          roundFixtures.push({
            id: `${matchweek}-${homeTeam.id}-${awayTeam.id}`,
            matchweek,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            date: new Date(currentDate),
            stadium: homeTeam.stadium
          });
        }
      }
      
      fixtures.push(...roundFixtures);
      
      // Rotate teams (keep first team fixed, rotate others)
      const lastTeam = teamList.pop()!;
      teamList.splice(1, 0, lastTeam);
      
      matchweek++;
      currentDate.setDate(currentDate.getDate() + 7); // Next week
    }

    // Generate second half of season (reverse fixtures)
    const firstHalfFixtures = [...fixtures];
    currentDate.setDate(currentDate.getDate() + 14); // Two-week break
    
    firstHalfFixtures.forEach(fixture => {
      fixtures.push({
        id: `${matchweek}-${fixture.awayTeamId}-${fixture.homeTeamId}`,
        matchweek,
        homeTeamId: fixture.awayTeamId, // Swap home and away
        awayTeamId: fixture.homeTeamId,
        date: new Date(currentDate),
        stadium: teams.find(t => t.id === fixture.awayTeamId)?.stadium || ''
      });
      
      // Increment matchweek for every few matches to spread them across weeks
      if (fixtures.filter(f => f.matchweek === matchweek).length >= numMatchesPerRound) {
        matchweek++;
        currentDate.setDate(currentDate.getDate() + 7);
      }
    });

    return fixtures;
  };

  if (teams.length < 2) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">⚽</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Need More Teams</h3>
        <p className="text-gray-500">Add at least 2 teams to generate fixtures</p>
      </div>
    );
  }

  const totalMatches = teams.length * (teams.length - 1);
  const totalMatchweeks = (teams.length - 1) * 2;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Season Fixtures</h2>
        <p className="text-gray-600">Create a complete double round-robin tournament</p>
      </div>

      {/* Season Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{teams.length}</div>
            <div className="text-sm text-green-600">Teams</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{totalMatches}</div>
            <div className="text-sm text-blue-600">Total Matches</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{totalMatchweeks}</div>
            <div className="text-sm text-purple-600">Matchweeks</div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Season Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Season Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Fixtures will be scheduled weekly starting from this date
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Tournament Format:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Double round-robin (each team plays every other team twice)</li>
                <li>• First half: Each team plays every other team once</li>
                <li>• Second half: Return fixtures with reversed home/away</li>
                <li>• Weekly fixtures with balanced home/away distribution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={generateFixtures}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Generating Fixtures...
            </div>
          ) : (
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Generate Complete Season
            </div>
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent mr-3"></div>
            <div>
              <p className="font-medium text-green-800">Creating your season fixtures...</p>
              <p className="text-sm text-green-600">
                Processing {totalMatches} matches across {totalMatchweeks} matchweeks
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
