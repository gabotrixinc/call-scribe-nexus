
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TemplateSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const TemplateSearch: React.FC<TemplateSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar plantillas..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default TemplateSearch;
