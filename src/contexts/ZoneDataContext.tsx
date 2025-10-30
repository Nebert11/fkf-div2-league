
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Fixture, Player } from '@/types/football';
import { supabase } from '@/integrations/supabase/client';

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

export const ZoneDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zoneDataMap, setZoneDataMap] = useState<Record<string, ZoneData>>({});

  // Fetch all teams/fixtures/players on mount
  useEffect(() => {
    async function fetchAll() {
      // Teams
      const { data: teamData } = await supabase.from('teams').select('*');
      // Fixtures
      const { data: fixtureData } = await supabase.from('fixtures').select('*');
      // Players
      const { data: playerData } = await supabase.from('players').select('*');

      const zones = new Set<string>();
      (teamData || []).forEach(t => zones.add(t.zoneId));
      (fixtureData || []).forEach(f => zones.add(f.zoneId));
      (playerData || []).forEach(p => zones.add(p.zoneId));

      const newMap: Record<string, ZoneData> = {};
      zones.forEach(zoneId => {
        newMap[zoneId] = {
          teams: (teamData || []).filter(t => t.zoneId === zoneId),
          fixtures: (fixtureData || []).filter(f => f.zoneId === zoneId),
          players: (playerData || []).filter(p => p.zoneId === zoneId),
        };
      });
      setZoneDataMap(newMap);
    }
    fetchAll();
  }, []);

  const getZoneData = (zoneId: string): ZoneData => {
    return zoneDataMap[zoneId] || { teams: [], fixtures: [], players: [] };
  };

  const updateZoneTeams = async (zoneId: string, teams: Team[]) => {
    await supabase.from('teams').delete().eq('zoneId', zoneId);
    if (teams.length > 0) await supabase.from('teams').upsert(teams);
    setZoneDataMap(prev => {
      const current = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return { ...prev, [zoneId]: { ...current, teams } };
    });
  };
  const updateZoneFixtures = async (zoneId: string, fixtures: Fixture[]) => {
    await supabase.from('fixtures').delete().eq('zoneId', zoneId);
    if (fixtures.length > 0) await supabase.from('fixtures').upsert(fixtures);
    setZoneDataMap(prev => {
      const current = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return { ...prev, [zoneId]: { ...current, fixtures } };
    });
  };
  const updateZonePlayers = async (zoneId: string, players: Player[]) => {
    await supabase.from('players').delete().eq('zoneId', zoneId);
    if (players.length > 0) await supabase.from('players').upsert(players);
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
