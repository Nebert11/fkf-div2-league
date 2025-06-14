
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
}
