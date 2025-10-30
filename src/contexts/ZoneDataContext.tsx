
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Fixture, Player } from '@/types/football';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SEASON_ID_2025_26 } from '@/constants/seasons';

interface ZoneData {
  teams: Team[];
  fixtures: Fixture[];
  players: Player[];
}

interface ZoneDataContextType {
  getZoneData: (zoneId: string) => ZoneData;
  updateZoneTeams: (zoneId: string, teams: Team[]) => Promise<void>;
  updateZoneFixtures: (zoneId: string, fixtures: Fixture[]) => Promise<void>;
  updateZonePlayers: (zoneId: string, players: Player[]) => Promise<void>;
}

const ZoneDataContext = createContext<ZoneDataContextType | undefined>(undefined);

export const useZoneData = () => {
  const context = useContext(ZoneDataContext);
  if (!context) throw new Error('useZoneData must be used within a ZoneDataProvider');
  return context;
};

function mapTeam(dbTeam: any): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    logo: dbTeam.logo_url || undefined,
    stadium: dbTeam.home_ground,
    zoneId: dbTeam.zone_id,
    createdAt: dbTeam.created_at ? new Date(dbTeam.created_at) : new Date(),
  };
}
function toDbTeam(team: Team) {
  return {
    id: team.id,
    name: team.name,
    logo_url: team.logo,
    home_ground: team.stadium,
    zone_id: team.zoneId,
    created_at: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
  };
}
function mapFixture(dbFixture: any): Fixture {
  return {
    id: dbFixture.id,
    matchweek: dbFixture.round_number,
    homeTeamId: dbFixture.home_team_id,
    awayTeamId: dbFixture.away_team_id,
    date: dbFixture.match_date ? new Date(dbFixture.match_date) : new Date(),
    stadium: dbFixture.venue,
    homeScore: dbFixture.home_score,
    awayScore: dbFixture.away_score,
    played: dbFixture.is_played,
    zoneId: '', // Will be filled in after grouping based on team
    goals: [], // Add goals mapping if stored separately
  };
}
function toDbFixture(fix: Fixture) {
  return {
    id: fix.id,
    round_number: fix.matchweek,
    home_team_id: fix.homeTeamId,
    away_team_id: fix.awayTeamId,
    match_date: fix.date instanceof Date ? fix.date.toISOString() : fix.date,
    venue: fix.stadium,
    home_score: fix.homeScore,
    away_score: fix.awayScore,
    is_played: fix.played,
    season_id: SEASON_ID_2025_26,
  };
}
function mapPlayer(dbPlayer: any): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    position: dbPlayer.position,
    teamId: dbPlayer.team_id,
    createdAt: dbPlayer.created_at ? new Date(dbPlayer.created_at) : new Date(),
  };
}
function toDbPlayer(player: Player) {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    team_id: player.teamId,
    created_at: player.createdAt instanceof Date ? player.createdAt.toISOString() : player.createdAt,
  };
}

export const ZoneDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zoneDataMap, setZoneDataMap] = useState<Record<string, ZoneData>>({});
  const { user } = useAuth();
  // For the season, you might set dynamically - here, dummy is used for mapping
  const dummySeasonId = "season-1";

  useEffect(() => {
    if (!user) {
      setZoneDataMap({});
      return;
    }
    async function fetchAll() {
      const { data: teamData } = await supabase.from('teams').select('*');
      const { data: fixtureData } = await supabase.from('fixtures').select('*');
      const { data: playerData } = await supabase.from('players').select('*');

      // Organize teams by zone
      const teamsByZone: Record<string, Team[]> = {};
      (teamData || []).forEach(dbTeam => {
        const team = mapTeam(dbTeam);
        if (!teamsByZone[team.zoneId]) teamsByZone[team.zoneId] = [];
        teamsByZone[team.zoneId].push(team);
      });

      // Helper for fixture/player zone lookups
      const teamZoneId: Record<string, string> = {};
      Object.entries(teamsByZone).forEach(([zoneId, arr]) => {
        arr.forEach(team => { teamZoneId[team.id] = zoneId; });
      });

      // Group fixtures by zone (zone of home team)
      const fixturesByZone: Record<string, Fixture[]> = {};
      (fixtureData || []).forEach(dbFix => {
        const fix = mapFixture(dbFix);
        // Prefer home team for zone grouping; fallback to away
        const homeZone = teamZoneId[fix.homeTeamId];
        const zoneId = homeZone || teamZoneId[fix.awayTeamId];
        if (!zoneId) return;
        fix.zoneId = zoneId;
        if (!fixturesByZone[zoneId]) fixturesByZone[zoneId] = [];
        fixturesByZone[zoneId].push(fix);
      });

      // Group players by zone (zone of their team)
      const playersByZone: Record<string, Player[]> = {};
      (playerData || []).forEach(dbPlayer => {
        const player = mapPlayer(dbPlayer);
        const zoneId = teamZoneId[player.teamId];
        if (!zoneId) return;
        if (!playersByZone[zoneId]) playersByZone[zoneId] = [];
        playersByZone[zoneId].push(player);
      });

      // Union all zoneIds
      const allZoneIds = new Set<string>([...Object.keys(teamsByZone), ...Object.keys(fixturesByZone), ...Object.keys(playersByZone)]);
      const newMap: Record<string, ZoneData> = {};
      allZoneIds.forEach(zoneId => {
        newMap[zoneId] = {
          teams: teamsByZone[zoneId] || [],
          fixtures: fixturesByZone[zoneId] || [],
          players: playersByZone[zoneId] || [],
        };
      });
      setZoneDataMap(newMap);
    }
    fetchAll();
  }, [user]);

  const getZoneData = (zoneId: string): ZoneData => {
    return zoneDataMap[zoneId] || { teams: [], fixtures: [], players: [] };
  };

  const updateZoneTeams = async (zoneId: string, teams: Team[]) => {
    const { error: deleteError } = await supabase.from('teams').delete().eq('zone_id', zoneId);
    if (deleteError) {
      console.error('Supabase delete teams error:', deleteError);
    }
    if (teams.length > 0) {
      const { error: upsertError } = await supabase.from('teams').upsert(teams.map(toDbTeam));
      if (upsertError) {
        console.error('Supabase upsert teams error:', upsertError);
      } else {
        console.log('Teams upserted to Supabase!', teams);
      }
    } else {
      console.log('Teams deleted from Supabase for zone', zoneId);
    }
    setZoneDataMap(prev => {
      const current = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return { ...prev, [zoneId]: { ...current, teams } };
    });
  };
  const updateZoneFixtures = async (zoneId: string, fixtures: Fixture[]) => {
    const { error: deleteError } = await supabase.from('fixtures').delete().in('id', fixtures.map(f => f.id));
    if (deleteError) {
      console.error('Supabase delete fixtures error:', deleteError);
    }
    if (fixtures.length > 0) {
      const { error: upsertError } = await supabase.from('fixtures').upsert(
        fixtures.map(f => toDbFixture(f))
      );
      if (upsertError) {
        console.error('Supabase upsert fixtures error:', upsertError);
      } else {
        console.log('Fixtures upserted to Supabase!', fixtures);
      }
    } else {
      console.log('Fixtures deleted from Supabase for zone', zoneId);
    }
    setZoneDataMap(prev => {
      const current = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return { ...prev, [zoneId]: { ...current, fixtures } };
    });
  };
  const updateZonePlayers = async (zoneId: string, players: Player[]) => {
    const { error: deleteError } = await supabase.from('players').delete().in('id', players.map(p => p.id));
    if (deleteError) {
      console.error('Supabase delete players error:', deleteError);
    }
    if (players.length > 0) {
      const { error: upsertError } = await supabase.from('players').upsert(players.map(toDbPlayer));
      if (upsertError) {
        console.error('Supabase upsert players error:', upsertError);
      } else {
        console.log('Players upserted to Supabase!', players);
      }
    } else {
      console.log('Players deleted from Supabase for zone', zoneId);
    }
    setZoneDataMap(prev => {
      const current = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return { ...prev, [zoneId]: { ...current, players } };
    });
  };

  const value: ZoneDataContextType = {
    getZoneData,
    updateZoneTeams,
    updateZoneFixtures,
    updateZonePlayers,
  };

  return (
    <ZoneDataContext.Provider value={value}>
      {children}
    </ZoneDataContext.Provider>
  );
};
