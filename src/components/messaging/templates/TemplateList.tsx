
import React from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X } from 'lucide-react';
import { MessageTemplate } from '@/types/messaging';
import TemplateSearch from './TemplateSearch';

interface TemplateListProps {
  templates: MessageTemplate[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTemplate: MessageTemplate | null;
  setSelectedTemplate: (template: MessageTemplate) => void;
  isLoading: boolean;
  activeCategory: string;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  searchTerm,
  setSearchTerm,
  selectedTemplate,
  setSelectedTemplate,
  isLoading,
  activeCategory,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" /> Aprobada
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pendiente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 mr-1" /> Rechazada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TemplateSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <ScrollArea className="h-[500px] border rounded-md">
        {templates.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No se encontraron plantillas
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`p-3 cursor-pointer border-b last:border-b-0 ${
                selectedTemplate?.id === template.id
                  ? 'bg-accent'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{template.name}</h4>
                {getStatusBadge(template.status)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {template.content}
              </p>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{template.category}</span>
                <span>
                  {new Date(template.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default TemplateList;
