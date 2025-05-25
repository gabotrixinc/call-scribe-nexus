
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-2xl p-6 mb-8">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent opacity-50"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
              <Filter className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Plantillas de Mensajes</h2>
              <p className="text-gray-400">Gestiona y organiza tus plantillas de respuesta</p>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar plantillas..." 
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
              />
            </div>
            
            <Select value={activeCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-300 text-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-slate-800/95 border border-white/20 backdrop-blur-2xl">
                <SelectItem value="all" className="rounded-xl focus:bg-purple-500/20 hover:bg-purple-500/10 transition-colors text-white">
                  Todas las categorías
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem 
                    key={category} 
                    value={category} 
                    className="rounded-xl focus:bg-purple-500/20 hover:bg-purple-500/10 transition-colors text-white"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Right section - Action button */}
        <Button 
          onClick={onCreateTemplate} 
          data-testid="create-template-button"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 px-6 py-3 h-12 text-white font-semibold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-2">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Nueva plantilla</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default TemplateActions;
