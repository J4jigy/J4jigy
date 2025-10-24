import React, { useState } from 'react';
import { ArrowLeft, Delete } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useBusiness } from '../contexts/BusinessContext';

export default function Calculator() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumberClick = (num) => {
    if (newNumber) {
      setDisplay(String(num));
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimalClick = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperationClick = (op) => {
    const currentValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculateResult();
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculateResult = () => {
    const current = parseFloat(display);
    const previous = previousValue;
    
    switch (operation) {
      case '+':
        return previous + current;
      case '-':
        return previous - current;
      case '×':
        return previous * current;
      case '÷':
        return previous / current;
      case '%':
        return previous % current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const result = calculateResult();
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const buttons = [
    { label: 'C', action: handleClear, className: 'bg-red-600 hover:bg-red-700' },
    { label: '⌫', action: handleBackspace, className: 'bg-slate-600 hover:bg-slate-700' },
    { label: '%', action: () => handleOperationClick('%'), className: 'bg-slate-600 hover:bg-slate-700' },
    { label: '÷', action: () => handleOperationClick('÷'), className: 'bg-cyan-600 hover:bg-cyan-700' },
    
    { label: '7', action: () => handleNumberClick(7), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '8', action: () => handleNumberClick(8), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '9', action: () => handleNumberClick(9), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '×', action: () => handleOperationClick('×'), className: 'bg-cyan-600 hover:bg-cyan-700' },
    
    { label: '4', action: () => handleNumberClick(4), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '5', action: () => handleNumberClick(5), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '6', action: () => handleNumberClick(6), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '-', action: () => handleOperationClick('-'), className: 'bg-cyan-600 hover:bg-cyan-700' },
    
    { label: '1', action: () => handleNumberClick(1), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '2', action: () => handleNumberClick(2), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '3', action: () => handleNumberClick(3), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '+', action: () => handleOperationClick('+'), className: 'bg-cyan-600 hover:bg-cyan-700' },
    
    { label: '±', action: handleToggleSign, className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '0', action: () => handleNumberClick(0), className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '.', action: handleDecimalClick, className: 'bg-slate-700 hover:bg-slate-600' },
    { label: '=', action: handleEquals, className: 'bg-green-600 hover:bg-green-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')} 
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Calculator</h1>
              <p className="text-slate-400 text-sm">{activeBusiness?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-sm w-full">
          <CardContent className="p-6">
            {/* Display */}
            <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
              <div className="text-right">
                {operation && previousValue !== null && (
                  <div className="text-sm text-slate-400 mb-1">
                    {previousValue} {operation}
                  </div>
                )}
                <div className="text-3xl font-bold text-white break-all">
                  {display}
                </div>
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-3">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className={`${button.className} text-white font-semibold text-xl rounded-lg h-16 transition-all active:scale-95 shadow-lg`}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {/* Quick Info */}
            <div className="mt-4 text-center text-xs text-slate-400">
              <p>Tap numbers and operations to calculate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
