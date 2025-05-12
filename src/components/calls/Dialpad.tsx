
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Phone, X, Delete, Hash, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneDialpadProps {
  value: string;
  onChange: (value: string) => void;
  onCall: () => void;
  onCancel: () => void;
  isCallInProgress?: boolean;
  className?: string;
}

const PhoneDialpad: React.FC<PhoneDialpadProps> = ({
  value,
  onChange,
  onCall,
  onCancel,
  isCallInProgress = false,
  className
}) => {
  const [isDtmfMode, setIsDtmfMode] = useState(false);
  const [dtmfTone, setDtmfTone] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio context for DTMF tones
    const audio = new Audio();
    setDtmfTone(audio);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const handleKeyPress = (key: string) => {
    onChange(value + key);
    
    // Play DTMF tone
    if (dtmfTone) {
      // Generate DTMF tone URLs based on the key
      const toneMap: Record<string, string> = {
        '1': '/audio/dtmf-1.mp3',
        '2': '/audio/dtmf-2.mp3',
        '3': '/audio/dtmf-3.mp3',
        '4': '/audio/dtmf-4.mp3',
        '5': '/audio/dtmf-5.mp3',
        '6': '/audio/dtmf-6.mp3',
        '7': '/audio/dtmf-7.mp3',
        '8': '/audio/dtmf-8.mp3',
        '9': '/audio/dtmf-9.mp3',
        '0': '/audio/dtmf-0.mp3',
        '*': '/audio/dtmf-star.mp3',
        '#': '/audio/dtmf-hash.mp3',
      };
      
      const toneUrl = toneMap[key];
      if (toneUrl) {
        dtmfTone.src = toneUrl;
        dtmfTone.play().catch(error => console.error('Error playing tone:', error));
      }
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };
  
  const dialpadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#'
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xl text-center font-medium h-12 pr-10"
          placeholder="Ingrese un número de teléfono"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {dialpadKeys.map((key) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            className="h-14 text-lg font-medium hover:bg-primary/10 hover:text-primary"
            onClick={() => handleKeyPress(key)}
            disabled={isCallInProgress}
          >
            {key === '#' ? <Hash className="h-4 w-4" /> : key}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={!value || isCallInProgress}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        
        <Button
          type="button"
          variant="default"
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={onCall}
          disabled={!value || isCallInProgress}
        >
          {isCallInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Llamando...
            </>
          ) : (
            <>
              <Phone className="mr-2 h-4 w-4" />
              Llamar
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-12 flex-shrink-0"
          onClick={handleBackspace}
          disabled={!value || isCallInProgress}
        >
          <Delete className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PhoneDialpad;
