import { Team, Fixture } from '@/types/football';

export const generateRoundRobinFixtures = (teams: Team[], startDate: Date): Fixture[] => {
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
          stadium: homeTeam.stadium,
          played: false
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
      stadium: teams.find(t => t.id === fixture.awayTeamId)?.stadium || '',
      played: false
    });
    
    // Increment matchweek for every few matches to spread them across weeks
    if (fixtures.filter(f => f.matchweek === matchweek).length >= numMatchesPerRound) {
      matchweek++;
      currentDate.setDate(currentDate.getDate() + 7);
    }
  });

  return fixtures;
};
