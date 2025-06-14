
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, Fixture, Player } from '@/types/football';

interface ZoneData {
  teams: Team[];
  fixtures: Fixture[];
  players: Player[];
}

interface ZoneDataContextType {
  getZoneData: (zoneId: string) => ZoneData;
  updateZoneTeams: (zoneId: string, teams: Team[]) => void;
  updateZoneFixtures: (zoneId: string, fixtures: Fixture[]) => void;
  updateZonePlayers: (zoneId: string, players: Player[]) => void;
}

const ZoneDataContext = createContext<ZoneDataContextType | undefined>(undefined);

export const useZoneData = () => {
  const context = useContext(ZoneDataContext);
  if (!context) {
    throw new Error('useZoneData must be used within a ZoneDataProvider');
  }
  return context;
};

interface ZoneDataProviderProps {
  children: ReactNode;
}

export const ZoneDataProvider: React.FC<ZoneDataProviderProps> = ({ children }) => {
  const [zoneDataMap, setZoneDataMap] = useState<Record<string, ZoneData>>({});

  const getZoneData = (zoneId: string): ZoneData => {
    return zoneDataMap[zoneId] || { teams: [], fixtures: [], players: [] };
  };

  const updateZoneTeams = (zoneId: string, teams: Team[]) => {
    setZoneDataMap(prev => ({
      ...prev,
      [zoneId]: {
        ...getZoneData(zoneId),
        teams,
      }
    }));
  };

  const updateZoneFixtures = (zoneId: string, fixtures: Fixture[]) => {
    setZoneDataMap(prev => ({
      ...prev,
      [zoneId]: {
        ...getZoneData(zoneId),
        fixtures,
      }
    }));
  };

  const updateZonePlayers = (zoneId: string, players: Player[]) => {
    setZoneDataMap(prev => ({
      ...prev,
      [zoneId]: {
        ...getZoneData(zoneId),
        players,
      }
    }));
  };

  const value = {
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
