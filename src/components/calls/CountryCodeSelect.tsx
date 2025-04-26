
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Country {
  code: string;
  flag: string;
  name: string;
  dial_code: string;
}

interface CountryCodeSelectProps {
  selectedCode: string;
  onSelect: (code: string) => void;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ selectedCode, onSelect }) => {
  // Lista simplificada de países con sus códigos telefónicos
  const countries: Country[] = [
    { code: 'ES', flag: '🇪🇸', name: 'España', dial_code: '+34' },
    { code: 'MX', flag: '🇲🇽', name: 'México', dial_code: '+52' },
    { code: 'CO', flag: '🇨🇴', name: 'Colombia', dial_code: '+57' },
    { code: 'AR', flag: '🇦🇷', name: 'Argentina', dial_code: '+54' },
    { code: 'PE', flag: '🇵🇪', name: 'Perú', dial_code: '+51' },
    { code: 'CL', flag: '🇨🇱', name: 'Chile', dial_code: '+56' },
    { code: 'US', flag: '🇺🇸', name: 'Estados Unidos', dial_code: '+1' },
  ];

  return (
    <Select 
      value={selectedCode} 
      onValueChange={onSelect}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Código">
          {countries.find(c => c.dial_code === selectedCode)?.flag} {selectedCode}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.dial_code}>
            <div className="flex items-center">
              <span className="mr-2">{country.flag}</span>
              <span>{country.name} ({country.dial_code})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;
