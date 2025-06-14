
import React from 'react';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SeasonOverviewProps {
  teamsCount: number;
}

export const SeasonOverview: React.FC<SeasonOverviewProps> = ({ teamsCount }) => {
  const totalMatches = teamsCount * (teamsCount - 1);
  const totalMatchweeks = (teamsCount - 1) * 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-800">{teamsCount}</div>
          <div className="text-sm text-green-600">Teams</div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-800">{totalMatches}</div>
          <div className="text-sm text-blue-600">Total Matches</div>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-800">{totalMatchweeks}</div>
          <div className="text-sm text-purple-600">Matchweeks</div>
        </CardContent>
      </Card>
    </div>
  );
};
