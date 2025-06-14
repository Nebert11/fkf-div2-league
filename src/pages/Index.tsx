import React, { useState } from 'react';
import { TeamManager } from '@/components/TeamManager';
import { FixtureGenerator } from '@/components/fixture-generator/FixtureGenerator';
import { FixtureDisplay } from '@/components/FixtureDisplay';
import { StandingsPage } from '@/components/StandingsPage';
import { Team, Fixture } from '@/types/football';

const Index = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'generate' | 'fixtures' | 'standings'>('teams');

  const handleTeamsUpdate = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    // Clear fixtures when teams change
    setFixtures([]);
  };

  const handleFixturesGenerated = (generatedFixtures: Fixture[]) => {
    setFixtures(generatedFixtures);
    setActiveTab('fixtures');
  };

  const handleFixturesUpdate = (updatedFixtures: Fixture[]) => {
    setFixtures(updatedFixtures);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">⚽ Fixture Fusion Football</h1>
            <p className="text-green-100 text-lg">Professional Football Season Generator</p>
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
            <TeamManager teams={teams} onTeamsUpdate={handleTeamsUpdate} />
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
              onFixturesUpdate={handleFixturesUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
