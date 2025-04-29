
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageTemplate, 
  TemplateVariable, 
  convertJsonToTemplateVariables, 
  convertTemplateVariablesToJson 
} from '@/types/messaging';

// Import our new component files
import TemplateList from './templates/TemplateList';
import TemplateEditor from './templates/TemplateEditor';
import TemplateDetails from './templates/TemplateDetails';
import TemplateHeader from './templates/TemplateHeader';
import DeleteTemplateDialog from './templates/DeleteTemplateDialog';
import EmptyTemplateState from './templates/EmptyTemplateState';

const TemplateManager = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<MessageTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('whatsapp_templates')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        const typedTemplates: MessageTemplate[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          content: item.content,
          category: item.category,
          status: item.status as 'approved' | 'pending' | 'rejected',
          language: item.language,
          variables: convertJsonToTemplateVariables(item.variables),
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setTemplates(typedTemplates);
        if (typedTemplates.length > 0) {
          setSelectedTemplate(typedTemplates[0]);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las plantillas',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  const handleEditTemplate = () => {
    if (selectedTemplate) {
      setEditedTemplate({ ...selectedTemplate });
      setIsEditing(true);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplate) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({
          name: editedTemplate.name,
          content: editedTemplate.content,
          category: editedTemplate.category,
          language: editedTemplate.language,
          variables: convertTemplateVariablesToJson(editedTemplate.variables),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editedTemplate.id);
      
      if (error) throw error;
      
      setTemplates(
        templates.map((t) =>
          t.id === editedTemplate.id
            ? { ...editedTemplate, updated_at: new Date().toISOString() }
            : t
        )
      );
      setSelectedTemplate({ ...editedTemplate, updated_at: new Date().toISOString() });
      
      toast({
        title: 'Plantilla guardada',
        description: 'La plantilla ha sido actualizada correctamente',
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la plantilla',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    const newTemplate: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Nueva Plantilla',
      content: 'Escribe el contenido de tu plantilla aquí. Puedes usar {{variable}} para definir variables.',
      category: 'general',
      status: 'pending',
      language: 'es',
      variables: [],
    };
    
    try {
      setIsSaving(true);
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert({
          ...newTemplate,
          created_at: now,
          updated_at: now,
          variables: convertTemplateVariablesToJson(newTemplate.variables),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newCreatedTemplate: MessageTemplate = {
        id: data.id,
        name: data.name,
        content: data.content,
        category: data.category,
        status: data.status as 'approved' | 'pending' | 'rejected',
        language: data.language,
        variables: convertJsonToTemplateVariables(data.variables),
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setTemplates([...templates, newCreatedTemplate]);
      setSelectedTemplate(newCreatedTemplate);
      setEditedTemplate(newCreatedTemplate);
      setIsEditing(true);
      
      toast({
        title: 'Plantilla creada',
        description: 'Se ha creado una nueva plantilla',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la plantilla',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      
      const updatedTemplates = templates.filter((t) => t.id !== selectedTemplate.id);
      setTemplates(updatedTemplates);
      
      if (updatedTemplates.length > 0) {
        setSelectedTemplate(updatedTemplates[0]);
      } else {
        setSelectedTemplate(null);
      }
      
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla ha sido eliminada correctamente',
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la plantilla',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVariable = () => {
    if (!editedTemplate) return;
    
    const newVariable: TemplateVariable = {
      name: `variable${editedTemplate.variables.length + 1}`,
      type: 'text',
      example: 'Ejemplo',
    };
    
    setEditedTemplate({
      ...editedTemplate,
      variables: [...editedTemplate.variables, newVariable],
      content: `${editedTemplate.content} {{${newVariable.name}}}`,
    });
  };

  const handleVariableChange = (index: number, field: keyof TemplateVariable, value: string) => {
    if (!editedTemplate) return;
    
    const updatedVariables = [...editedTemplate.variables];
    
    if (field === 'name' && updatedVariables[index]) {
      const oldName = updatedVariables[index].name;
      const newContent = editedTemplate.content.replace(
        `{{${oldName}}}`,
        `{{${value}}}`
      );
      setEditedTemplate({
        ...editedTemplate,
        content: newContent,
      });
    }
    
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    
    setEditedTemplate({
      ...editedTemplate,
      variables: updatedVariables,
    });
  };

  const handleRemoveVariable = (index: number) => {
    if (!editedTemplate) return;
    
    const variableName = editedTemplate.variables[index].name;
    const updatedVariables = editedTemplate.variables.filter((_, i) => i !== index);
    const updatedContent = editedTemplate.content.replace(`{{${variableName}}}`, '');
    
    setEditedTemplate({
      ...editedTemplate,
      variables: updatedVariables,
      content: updatedContent,
    });
  };

  const handleEditFieldChange = (field: keyof MessageTemplate, value: string) => {
    if (!editedTemplate) return;
    
    setEditedTemplate({
      ...editedTemplate,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Plantillas de Mensajes</h3>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <TemplateList 
            templates={templates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={isLoading}
            activeCategory={activeCategory}
          />
        </div>
        
        <Card className="md:col-span-2">
          {selectedTemplate ? (
            <>
              <CardHeader>
                <TemplateHeader 
                  template={selectedTemplate}
                  isEditing={isEditing}
                  onEdit={handleEditTemplate}
                  onDelete={() => setIsDeleteDialogOpen(true)}
                />
              </CardHeader>
              <CardContent>
                {isEditing && editedTemplate ? (
                  <TemplateEditor 
                    template={editedTemplate}
                    onCancel={() => {
                      setIsEditing(false);
                      setEditedTemplate(null);
                    }}
                    onSave={handleSaveTemplate}
                    onChange={handleEditFieldChange}
                    onAddVariable={handleAddVariable}
                    onVariableChange={handleVariableChange}
                    onRemoveVariable={handleRemoveVariable}
                    isSaving={isSaving}
                  />
                ) : (
                  <TemplateDetails 
                    template={selectedTemplate}
                    onEdit={handleEditTemplate}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                  />
                )}
              </CardContent>
            </>
          ) : (
            <CardContent>
              <EmptyTemplateState onCreate={handleCreateTemplate} />
            </CardContent>
          )}
        </Card>
      </div>

      <DeleteTemplateDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteTemplate}
        isDeleting={isSaving}
      />
    </div>
  );
};

export default TemplateManager;
