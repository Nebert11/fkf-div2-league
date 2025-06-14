
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { ZONES } from '@/constants/zones';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">⚽ FKF Division 2 League</h1>
            <p className="text-green-100 text-lg">Professional Football Season Management System</p>
          </div>
        </div>
      </div>

      {/* Zone Selection */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Select League Zone</h2>
          <p className="text-gray-600 text-lg">Choose a zone to manage teams, fixtures, and standings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {ZONES.map((zone) => (
            <Card key={zone.id} className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">{zone.letter}</span>
                </div>
                <CardTitle className="text-xl text-gray-800">{zone.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Link to={`/zone/${zone.id}`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Manage Zone {zone.letter}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-gray-800">League Information</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🏆 Team Management</h3>
                  <p className="text-green-600 text-sm">Add and manage teams for each zone</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📅 Fixture Generation</h3>
                  <p className="text-blue-600 text-sm">Automatic double round-robin fixtures</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">📊 Match Results</h3>
                  <p className="text-purple-600 text-sm">Record scores and goal scorers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
