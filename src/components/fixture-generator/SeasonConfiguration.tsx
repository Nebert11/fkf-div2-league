
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SeasonConfigurationProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
}

export const SeasonConfiguration: React.FC<SeasonConfigurationProps> = ({
  startDate,
  onStartDateChange
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Season Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="startDate">Season Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="mt-1 max-w-xs"
            />
            <p className="text-sm text-gray-500 mt-1">
              Fixtures will be scheduled weekly starting from this date
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Tournament Format:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Double round-robin (each team plays every other team twice)</li>
              <li>• First half: Each team plays every other team once</li>
              <li>• Second half: Return fixtures with reversed home/away</li>
              <li>• Weekly fixtures with balanced home/away distribution</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
