
export interface Team {
  id: string;
  name: string;
  stadium: string;
  logo?: string;
  createdAt: Date;
}

export interface Fixture {
  id: string;
  matchweek: number;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
  stadium: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string;
  createdAt: Date;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
  cleanSheets: number;
  appearances: number;
}
