import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Team } from '@/types/football';
import { v4 as uuidv4 } from 'uuid';

interface TeamManagerProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
  zoneId?: string;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamsUpdate, zoneId = 'zone-a' }) => {
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    stadium: '',
    logo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.stadium.trim()) return;

    if (editingTeam) {
      // Update existing team
      const updatedTeams = teams.map(team =>
        team.id === editingTeam.id
          ? { ...team, ...formData }
          : team
      );
      onTeamsUpdate(updatedTeams);
      setEditingTeam(null);
    } else {
      // Add new team
      const newTeam: Team = {
        id: uuidv4(),
        ...formData,
        zoneId,
        createdAt: new Date()
      };
      onTeamsUpdate([...teams, newTeam]);
      setIsAddingTeam(false);
    }

    setFormData({ name: '', stadium: '', logo: '' });
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      stadium: team.stadium,
      logo: team.logo || ''
    });
    setIsAddingTeam(false);
  };

  const handleDelete = (teamId: string) => {
    onTeamsUpdate(teams.filter(team => team.id !== teamId));
  };

  const handleCancel = () => {
    setIsAddingTeam(false);
    setEditingTeam(null);
    setFormData({ name: '', stadium: '', logo: '' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
          <p className="text-gray-600">Add and manage your football teams</p>
        </div>
        {!isAddingTeam && !editingTeam && (
          <Button
            onClick={() => setIsAddingTeam(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        )}
      </div>

      {/* Add/Edit Team Form */}
      {(isAddingTeam || editingTeam) && (
        <Card className="mb-6 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Manchester United"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stadium">Home Stadium</Label>
                  <Input
                    id="stadium"
                    type="text"
                    value={formData.stadium}
                    onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                    placeholder="e.g., Old Trafford"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="logo">Team Logo (Optional)</Label>
                <div className="mt-1 flex items-center space-x-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {formData.logo && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={formData.logo}
                        alt="Team logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingTeam ? 'Update Team' : 'Add Team'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No teams added yet</h3>
          <p className="text-gray-500">Add your first team to get started with fixture generation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {team.logo ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.stadium}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(team.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {teams.length >= 2 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            ✅ Ready to generate fixtures! You have {teams.length} teams registered.
          </p>
          <p className="text-green-600 text-sm mt-1">
            A complete season will have {teams.length * (teams.length - 1)} matches 
            ({teams.length - 1} matches per team, home and away).
          </p>
        </div>
      )}
    </div>
  );
};
