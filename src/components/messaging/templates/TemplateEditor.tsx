
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2 } from 'lucide-react';
import { MessageTemplate, TemplateVariable } from '@/types/messaging';
import TemplateVariables from './TemplateVariables';

interface TemplateEditorProps {
  template: MessageTemplate;
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: keyof MessageTemplate, value: string) => void;
  onAddVariable: () => void;
  onVariableChange: (index: number, field: keyof TemplateVariable, value: string) => void;
  onRemoveVariable: (index: number) => void;
  isSaving: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onCancel,
  onSave,
  onChange,
  onAddVariable,
  onVariableChange,
  onRemoveVariable,
  isSaving,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Nombre de la plantilla</Label>
        <Input
          id="template-name"
          value={template.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template-category">Categoría</Label>
        <Input
          id="template-category"
          value={template.category}
          onChange={(e) => onChange('category', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template-content">Contenido</Label>
        <Textarea
          id="template-content"
          value={template.content}
          onChange={(e) => onChange('content', e.target.value)}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Use {{variable}} para definir variables que se pueden reemplazar.
        </p>
      </div>
      
      <TemplateVariables 
        variables={template.variables}
        onAddVariable={onAddVariable}
        onVariableChange={onVariableChange}
        onRemoveVariable={onRemoveVariable}
      />
      
      <div className="flex space-x-2 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditor;
