import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Fuel, Zap, Gauge, CircleDot, Square, Triangle, Diamond, Star, Heart, Hexagon, Octagon, Plus, Minus, X, Check } from 'lucide-react';

const FuelDispenser = () => {
  const navigate = useNavigate();
  
  // Array of 16 different icons for fuel dispensing units
  const fuelIcons = [
    Fuel, Zap, Gauge, CircleDot, 
    Square, Triangle, Diamond, Star,
    Heart, Hexagon, Octagon, Plus,
    Minus, X, Check, Fuel
  ];

  const handleDispenserClick = (index) => {
    // Handle dispenser selection logic here
    console.log(`Dispenser ${index + 1} selected`);
    // You can add navigation or state management here
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/cash-in')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Fuel Dispensers</h1>
        
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Fuel Dispenser Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {Array.from({ length: 16 }, (_, index) => {
            const IconComponent = fuelIcons[index];
            return (
              <Button
                key={index}
                variant="outline"
                className="bg-orange-600 border-orange-700 text-white hover:bg-orange-500 w-12 h-12 p-0 flex items-center justify-center aspect-square"
                onClick={() => handleDispenserClick(index)}
              >
                <IconComponent className="w-5 h-5" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FuelDispenser;