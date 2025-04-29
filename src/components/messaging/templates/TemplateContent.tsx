
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MessageTemplate, TemplateVariable } from '@/types/messaging';
import TemplateHeader from './TemplateHeader';
import TemplateEditor from './TemplateEditor';
import TemplateDetails from './TemplateDetails';
import EmptyTemplateState from './EmptyTemplateState';

interface TemplateContentProps {
  selectedTemplate: MessageTemplate | null;
  isEditing: boolean;
  editedTemplate: MessageTemplate | null;
  isSaving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCreate: () => void;
  onChange: (field: keyof MessageTemplate, value: string) => void;
  onAddVariable: () => void;
  onVariableChange: (index: number, field: keyof TemplateVariable, value: string) => void;
  onRemoveVariable: (index: number) => void;
}

const TemplateContent: React.FC<TemplateContentProps> = ({
  selectedTemplate,
  isEditing,
  editedTemplate,
  isSaving,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onCreate,
  onChange,
  onAddVariable,
  onVariableChange,
  onRemoveVariable,
}) => {
  return (
    <Card className="md:col-span-2">
      {selectedTemplate ? (
        <>
          <CardHeader>
            <TemplateHeader 
              template={selectedTemplate}
              isEditing={isEditing}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </CardHeader>
          <CardContent>
            {isEditing && editedTemplate ? (
              <TemplateEditor 
                template={editedTemplate}
                onCancel={onCancel}
                onSave={onSave}
                onChange={onChange}
                onAddVariable={onAddVariable}
                onVariableChange={onVariableChange}
                onRemoveVariable={onRemoveVariable}
                isSaving={isSaving}
              />
            ) : (
              <TemplateDetails 
                template={selectedTemplate}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </CardContent>
        </>
      ) : (
        <CardContent>
          <EmptyTemplateState onCreate={onCreate} />
        </CardContent>
      )}
    </Card>
  );
};

export default TemplateContent;
