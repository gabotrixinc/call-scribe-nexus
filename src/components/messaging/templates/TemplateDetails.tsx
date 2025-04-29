
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { MessageTemplate } from '@/types/messaging';
import TemplateVariables from './TemplateVariables';
import { useToast } from '@/components/ui/use-toast';

interface TemplateDetailsProps {
  template: MessageTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateDetails: React.FC<TemplateDetailsProps> = ({
  template,
  onEdit,
  onDelete,
}) => {
  const { toast } = useToast();
  
  const handleTestSend = () => {
    toast({
      title: "Envío de prueba",
      description: "Esta funcionalidad estará disponible próximamente.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Categoría</h4>
        <p>{template.category}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1">Contenido</h4>
        <div className="p-3 border rounded-md whitespace-pre-wrap">
          {template.content}
        </div>
      </div>
      
      <TemplateVariables variables={template.variables} readOnly />
      
      <div className="flex justify-end">
        <Button variant="outline" className="ml-auto" onClick={handleTestSend}>
          <Send className="h-4 w-4 mr-2" /> Probar envío
        </Button>
      </div>
    </div>
  );
};

export default TemplateDetails;
