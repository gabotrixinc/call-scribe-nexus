
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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 glass-card p-6 mb-6 relative overflow-hidden group">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 relative z-10">
        <h3 className="text-lg font-medium neo-gradient glow-text">Plantillas de Mensajes</h3>
        <Select value={activeCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] glass-card backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="glass-card backdrop-blur-xl border-white/20">
            <SelectItem value="all" className="focus:bg-primary/20 hover:bg-primary/10 transition-colors">
              Todas las categorías
            </SelectItem>
            {categories.map((category) => (
              <SelectItem 
                key={category} 
                value={category} 
                className="focus:bg-primary/20 hover:bg-primary/10 transition-colors"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onCreateTemplate} 
        data-testid="create-template-button"
        className="modern-button relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-hover group z-10"
      >
        <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
        Nueva plantilla
      </Button>
    </div>
  );
};

export default TemplateActions;
