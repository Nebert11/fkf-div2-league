
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
    console.log('Getting zone data for:', zoneId, 'Current data:', zoneDataMap[zoneId]);
    return zoneDataMap[zoneId] || { teams: [], fixtures: [], players: [] };
  };

  const updateZoneTeams = (zoneId: string, teams: Team[]) => {
    console.log('Updating teams for zone:', zoneId, 'Teams:', teams);
    setZoneDataMap(prev => {
      const currentZoneData = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      const newData = {
        ...prev,
        [zoneId]: {
          ...currentZoneData,
          teams,
        }
      };
      console.log('New zone data map:', newData);
      return newData;
    });
  };

  const updateZoneFixtures = (zoneId: string, fixtures: Fixture[]) => {
    setZoneDataMap(prev => {
      const currentZoneData = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return {
        ...prev,
        [zoneId]: {
          ...currentZoneData,
          fixtures,
        }
      };
    });
  };

  const updateZonePlayers = (zoneId: string, players: Player[]) => {
    setZoneDataMap(prev => {
      const currentZoneData = prev[zoneId] || { teams: [], fixtures: [], players: [] };
      return {
        ...prev,
        [zoneId]: {
          ...currentZoneData,
          players,
        }
      };
    });
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
