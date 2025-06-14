
import React, { useState } from 'react';
import { Calendar, MapPin, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Team, Fixture } from '@/types/football';

interface FixtureDisplayProps {
  fixtures: Fixture[];
  teams: Team[];
}

export const FixtureDisplay: React.FC<FixtureDisplayProps> = ({ fixtures, teams }) => {
  const [selectedMatchweek, setSelectedMatchweek] = useState<number>(1);

  const getTeamById = (id: string): Team | undefined => {
    return teams.find(team => team.id === id);
  };

  const maxMatchweek = Math.max(...fixtures.map(f => f.matchweek));
  const fixturesByMatchweek = fixtures.reduce((acc, fixture) => {
    if (!acc[fixture.matchweek]) {
      acc[fixture.matchweek] = [];
    }
    acc[fixture.matchweek].push(fixture);
    return acc;
  }, {} as Record<number, Fixture[]>);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation library
    console.log('Generating PDF for all fixtures...');
    // Placeholder for PDF generation
    alert('PDF generation would be implemented here using a library like jsPDF or Puppeteer');
  };

  if (fixtures.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Fixtures Generated</h3>
        <p className="text-gray-500">Generate fixtures first to view the season schedule</p>
      </div>
    );
  }

  const currentWeekFixtures = fixturesByMatchweek[selectedMatchweek] || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Season Fixtures</h2>
          <p className="text-gray-600">
            {fixtures.length} matches across {maxMatchweek} matchweeks
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Matchweek Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedMatchweek(Math.max(1, selectedMatchweek - 1))}
              disabled={selectedMatchweek === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">Matchweek {selectedMatchweek}</h3>
              <p className="text-sm text-gray-600">
                {currentWeekFixtures.length > 0 && formatDate(currentWeekFixtures[0].date)}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSelectedMatchweek(Math.min(maxMatchweek, selectedMatchweek + 1))}
              disabled={selectedMatchweek === maxMatchweek}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Matchweek Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Week 1</span>
              <span>Week {maxMatchweek}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(selectedMatchweek / maxMatchweek) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixtures for Selected Matchweek */}
      <div className="space-y-4">
        {currentWeekFixtures.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No fixtures for this matchweek</p>
            </CardContent>
          </Card>
        ) : (
          currentWeekFixtures.map((fixture) => {
            const homeTeam = getTeamById(fixture.homeTeamId);
            const awayTeam = getTeamById(fixture.awayTeamId);

            if (!homeTeam || !awayTeam) return null;

            return (
              <Card key={fixture.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center space-x-3 flex-1">
                      {homeTeam.logo ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={homeTeam.logo}
                            alt={`${homeTeam.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            {homeTeam.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{homeTeam.name}</p>
                        <p className="text-sm text-gray-600">HOME</p>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 mb-1">VS</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(fixture.date).split(',')[0]}
                        </div>
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{awayTeam.name}</p>
                        <p className="text-sm text-gray-600">AWAY</p>
                      </div>
                      {awayTeam.logo ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={awayTeam.logo}
                            alt={`${awayTeam.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {awayTeam.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stadium Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {fixture.stadium}
                      <Calendar className="w-4 h-4 ml-4 mr-1" />
                      {formatDate(fixture.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Season Summary */}
      <Card className="mt-8 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Season Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-800">{teams.length}</div>
              <div className="text-sm text-green-600">Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">{fixtures.length}</div>
              <div className="text-sm text-green-600">Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">{maxMatchweek}</div>
              <div className="text-sm text-green-600">Matchweeks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">
                {Math.round(fixtures.length / maxMatchweek)}
              </div>
              <div className="text-sm text-green-600">Matches/Week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
