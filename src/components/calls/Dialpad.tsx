import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  X, 
  Plus, 
  Delete 
} from 'lucide-react';

interface DialpadProps {
  value: string;
  onChange: (value: string) => void;
  onCall?: () => void;
  onCancel?: () => void;
}

const PhoneDialpad: React.FC<DialpadProps> = ({ 
  value, 
  onChange, 
  onCall, 
  onCancel 
}) => {
  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#'
  ];

  const handleButtonPress = (digit: string) => {
    onChange(`${value}${digit}`);
  };

  const handleDeletePress = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between w-full p-2 text-xl bg-muted/20 border rounded-md">
        <span className="flex-1 overflow-x-auto whitespace-nowrap">{value || 'Ingrese número'}</span>
        {value && (
          <button 
            onClick={handleDeletePress}
            className="p-1 hover:bg-muted/50 rounded-full"
          >
            <Delete className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((btn) => (
          <Button 
            key={btn} 
            variant="outline" 
            onClick={() => handleButtonPress(btn)}
            className="h-14 text-lg font-medium hover:bg-primary hover:text-primary-foreground"
          >
            {btn}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="flex-1" 
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          variant="default"
          className="flex-1 bg-green-600 hover:bg-green-700" 
          onClick={onCall}
          disabled={!value || value.length < 6}
        >
          <Phone className="mr-2 h-4 w-4" />
          Llamar
        </Button>
      </div>
    </div>
  );
};

export default PhoneDialpad;
