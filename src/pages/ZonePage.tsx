
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TeamManager } from '@/components/TeamManager';
import { FixtureGenerator } from '@/components/fixture-generator/FixtureGenerator';
import { FixtureDisplay } from '@/components/FixtureDisplay';
import { StandingsPage } from '@/components/StandingsPage';
import { Navigation } from '@/components/Navigation';
import { useZoneData } from '@/contexts/ZoneDataContext';
import { Team, Fixture, Player } from '@/types/football';
import { ZONES } from '@/constants/zones';

const ZonePage = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const { getZoneData, updateZoneTeams, updateZoneFixtures, updateZonePlayers } = useZoneData();
  const [activeTab, setActiveTab] = useState<'teams' | 'generate' | 'fixtures' | 'standings'>('teams');

  const zone = ZONES.find(z => z.id === zoneId);
  
  if (!zone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <Navigation />
        <div className="p-6 text-center">Zone not found</div>
      </div>
    );
  }

  // Get zone-specific data
  const zoneData = getZoneData(zone.id);
  const { teams, fixtures, players } = zoneData;

  console.log('ZonePage render - Zone:', zone.id, 'Teams:', teams, 'Active tab:', activeTab);

  const handleTeamsUpdate = (updatedTeams: Team[]) => {
    console.log('handleTeamsUpdate called with:', updatedTeams);
    const teamsWithZone = updatedTeams.map(team => ({ ...team, zoneId: zone.id }));
    updateZoneTeams(zone.id, teamsWithZone);
    // Clear fixtures when teams change
    updateZoneFixtures(zone.id, []);
  };

  const handleFixturesGenerated = (generatedFixtures: Fixture[]) => {
    const fixturesWithZone = generatedFixtures.map(fixture => ({ ...fixture, zoneId: zone.id }));
    updateZoneFixtures(zone.id, fixturesWithZone);
    setActiveTab('fixtures');
  };

  const handleFixturesUpdate = (updatedFixtures: Fixture[]) => {
    updateZoneFixtures(zone.id, updatedFixtures);
  };

  const handlePlayersUpdate = (updatedPlayers: Player[]) => {
    updateZonePlayers(zone.id, updatedPlayers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">⚽ FKF Division 2 League</h1>
            <p className="text-green-100 text-xl">{zone.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'teams'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              🏆 Manage Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              disabled={teams.length < 2}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'bg-green-600 text-white shadow-md'
                  : teams.length < 2
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              ⚡ Generate Fixtures
            </button>
            <button
              onClick={() => setActiveTab('fixtures')}
              disabled={fixtures.length === 0}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'fixtures'
                  ? 'bg-green-600 text-white shadow-md'
                  : fixtures.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              📅 View Fixtures ({fixtures.length})
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              disabled={fixtures.length === 0}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'standings'
                  ? 'bg-green-600 text-white shadow-md'
                  : fixtures.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              📊 Standings & Stats
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {activeTab === 'teams' && (
            <TeamManager teams={teams} onTeamsUpdate={handleTeamsUpdate} zoneId={zone.id} />
          )}
          {activeTab === 'generate' && (
            <FixtureGenerator teams={teams} onFixturesGenerated={handleFixturesGenerated} />
          )}
          {activeTab === 'fixtures' && (
            <FixtureDisplay fixtures={fixtures} teams={teams} />
          )}
          {activeTab === 'standings' && (
            <StandingsPage 
              teams={teams} 
              fixtures={fixtures} 
              players={players}
              onFixturesUpdate={handleFixturesUpdate}
              onPlayersUpdate={handlePlayersUpdate}
              zoneName={zone.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ZonePage;
