
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { TemplateVariable } from '@/types/messaging';

interface TemplateVariablesProps {
  variables: TemplateVariable[];
  readOnly?: boolean;
  onAddVariable?: () => void;
  onVariableChange?: (index: number, field: keyof TemplateVariable, value: string) => void;
  onRemoveVariable?: (index: number) => void;
}

const TemplateVariables: React.FC<TemplateVariablesProps> = ({
  variables,
  readOnly = false,
  onAddVariable,
  onVariableChange,
  onRemoveVariable,
}) => {
  if (readOnly) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-1">Variables</h4>
        {variables && variables.length > 0 ? (
          <div className="grid gap-2 grid-cols-2">
            {variables.map((variableItem, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <div>
                  <span className="font-mono text-sm">
                    {`{{${variableItem.name}}}`}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: {variableItem.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay variables definidas para esta plantilla.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Variables</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddVariable}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" /> Agregar variable
        </Button>
      </div>
      
      {variables.length > 0 ? (
        <div className="space-y-4">
          {variables.map((variableItem, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 items-center">
              <Input
                value={variableItem.name}
                onChange={(e) =>
                  onVariableChange && onVariableChange(index, 'name', e.target.value)
                }
                placeholder="Nombre"
              />
              <Input
                value={variableItem.example}
                onChange={(e) =>
                  onVariableChange && onVariableChange(index, 'example', e.target.value)
                }
                placeholder="Ejemplo"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onRemoveVariable && onRemoveVariable(index)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Quitar
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay variables definidas para esta plantilla.
        </p>
      )}
    </div>
  );
};

export default TemplateVariables;
