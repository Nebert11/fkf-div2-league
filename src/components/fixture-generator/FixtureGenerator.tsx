
import React, { useState } from 'react';
import { Team, Fixture } from '@/types/football';
import { SeasonOverview } from './SeasonOverview';
import { SeasonConfiguration } from './SeasonConfiguration';
import { GenerateButton } from './GenerateButton';
import { generateRoundRobinFixtures } from '@/utils/fixtureUtils';

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

      <SeasonOverview teamsCount={teams.length} />
      
      <SeasonConfiguration 
        startDate={startDate}
        onStartDateChange={setStartDate}
      />

      <GenerateButton
        isGenerating={isGenerating}
        onGenerate={generateFixtures}
        totalMatches={totalMatches}
        totalMatchweeks={totalMatchweeks}
      />
    </div>
  );
};
