
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TemplateActionsProps {
  onCreateTemplate: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const TemplateActions: React.FC<TemplateActionsProps> = ({ 
  onCreateTemplate, 
  activeCategory,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-medium">Plantillas de Mensajes</h3>
        <Select value={activeCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onCreateTemplate} data-testid="create-template-button">
        <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
      </Button>
    </div>
  );
};

export default TemplateActions;
