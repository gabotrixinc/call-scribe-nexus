
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X } from 'lucide-react';
import { MessageTemplate } from '@/types/messaging';

interface TemplateHeaderProps {
  template: MessageTemplate;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  template,
  isEditing,
  onEdit,
  onDelete,
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

  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>
          {getStatusBadge(template.status)}
          <span className="ml-2">
            Última actualización:{' '}
            {new Date(template.updated_at).toLocaleDateString()}
          </span>
        </CardDescription>
      </div>
      <div className="flex space-x-2">
        {!isEditing && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateHeader;
