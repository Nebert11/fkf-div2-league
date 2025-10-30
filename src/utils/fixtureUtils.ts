
import { Team, Fixture } from '@/types/football';
import { v4 as uuidv4 } from 'uuid';

export const generateRoundRobinFixtures = (teams: Team[], startDate: Date): Fixture[] => {
  const fixtures: Fixture[] = [];
  const numTeams = teams.length;

  if (numTeams < 2) {
    return [];
  }

  const teamList = [...teams];
  if (numTeams % 2 === 1) {
    teamList.push({ id: 'bye', name: 'BYE', stadium: '', zoneId: teams[0]?.zoneId || 'zone-a', createdAt: new Date() });
  }

  const totalTeams = teamList.length;
  const numRounds = totalTeams - 1;
  
  let currentDate = new Date(startDate);
  const teamLastVenue: { [teamId: string]: 'home' | 'away' } = {};

  // Generate first half of season
  for (let round = 0; round < numRounds; round++) {
    const roundFixtures: Fixture[] = [];
    const pairedTeams = new Set<string>();

    for (let i = 0; i < totalTeams / 2; i++) {
      const team1 = teamList[i];
      const team2 = teamList[totalTeams - 1 - i];

      if (team1.id === 'bye' || team2.id === 'bye' || pairedTeams.has(team1.id) || pairedTeams.has(team2.id)) {
        continue;
      }
      
      const lastVenue1 = teamLastVenue[team1.id];
      const lastVenue2 = teamLastVenue[team2.id];

      let homeTeam = team1;
      let awayTeam = team2;

      if (lastVenue1 === 'home' && lastVenue2 !== 'home') {
        homeTeam = team2;
        awayTeam = team1;
      } else if (lastVenue1 !== 'away' && lastVenue2 === 'away') {
        homeTeam = team1;
        awayTeam = team2;
      } else if (round % 2 === 1) { 
        homeTeam = team2;
        awayTeam = team1;
      }

      roundFixtures.push({
        id: uuidv4(),
        matchweek: round + 1,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        date: new Date(currentDate),
        stadium: teams.find(t => t.id === homeTeam.id)?.stadium || '',
        played: false,
        zoneId: homeTeam.zoneId,
      });

      teamLastVenue[homeTeam.id] = 'home';
      teamLastVenue[awayTeam.id] = 'away';
      pairedTeams.add(homeTeam.id);
      pairedTeams.add(awayTeam.id);
    }

    fixtures.push(...roundFixtures);
    
    const lastTeam = teamList.pop()!;
    teamList.splice(1, 0, lastTeam);
    
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Generate second half of season (reverse fixtures)
  const firstHalfFixtures = [...fixtures];
  currentDate.setDate(currentDate.getDate() + 14);
  
  for (const fixture of firstHalfFixtures) {
    const homeTeam = teams.find(t => t.id === fixture.awayTeamId);
    if (!homeTeam) continue;

    fixtures.push({
      id: uuidv4(),
      matchweek: fixture.matchweek + numRounds,
      homeTeamId: fixture.awayTeamId,
      awayTeamId: fixture.homeTeamId,
      date: new Date(currentDate.getTime() + (fixture.matchweek - 1) * 7 * 24 * 60 * 60 * 1000),
      stadium: homeTeam.stadium,
      played: false,
      zoneId: fixture.zoneId,
    });
  }

  return fixtures;
};
