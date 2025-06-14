
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ZONES } from '@/constants/zones';

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600 hover:text-green-700">
            ⚽ FKF Division 2 League
          </Link>
          
          <div className="flex space-x-2">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'outline'}
                className="text-sm"
              >
                Home
              </Button>
            </Link>
            {ZONES.map((zone) => (
              <Link key={zone.id} to={`/zone/${zone.id}`}>
                <Button 
                  variant={location.pathname === `/zone/${zone.id}` ? 'default' : 'outline'}
                  className="text-sm"
                >
                  Zone {zone.letter}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
