
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TemplateActionsProps {
  onCreateTemplate: () => void;
}

const TemplateActions: React.FC<TemplateActionsProps> = ({ onCreateTemplate }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Plantillas de Mensajes</h3>
      <Button onClick={onCreateTemplate}>
        <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
      </Button>
    </div>
  );
};

export default TemplateActions;
