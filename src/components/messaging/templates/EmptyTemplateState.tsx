
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyTemplateStateProps {
  onCreate: () => void;
}

const EmptyTemplateState: React.FC<EmptyTemplateStateProps> = ({ onCreate }) => {
  return (
    <div className="flex items-center justify-center p-12 text-center">
      <div>
        <h3 className="font-medium">No hay plantilla seleccionada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seleccione una plantilla de la lista o cree una nueva.
        </p>
        <Button className="mt-4" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
        </Button>
      </div>
    </div>
  );
};

export default EmptyTemplateState;
