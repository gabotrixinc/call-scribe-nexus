
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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 backdrop-blur-sm p-4 rounded-xl bg-secondary/20 border border-white/10 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <h3 className="text-lg font-medium glow-text">Plantillas de Mensajes</h3>
        <Select value={activeCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-white/10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-background/80 backdrop-blur-lg border-white/10">
            <SelectItem value="all" className="focus:bg-primary/20">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category} className="focus:bg-primary/20">{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onCreateTemplate} data-testid="create-template-button" 
        className="bg-primary hover:bg-primary/80 transition-all duration-300 shadow-lg shadow-primary/20">
        <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
      </Button>
    </div>
  );
};

export default TemplateActions;
