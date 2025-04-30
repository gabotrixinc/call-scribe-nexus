
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageTemplate, 
  TemplateVariable, 
  convertJsonToTemplateVariables, 
  convertTemplateVariablesToJson 
} from '@/types/messaging';

interface UseTemplatesState {
  templates: MessageTemplate[];
  selectedTemplate: MessageTemplate | null;
  isLoading: boolean;
  isEditing: boolean;
  editedTemplate: MessageTemplate | null;
  isSaving: boolean;
  isDeleteDialogOpen: boolean;
  error: string | null;
}

export const useTemplates = () => {
  const [state, setState] = useState<UseTemplatesState>({
    templates: [],
    selectedTemplate: null,
    isLoading: true,
    isEditing: false,
    editedTemplate: null,
    isSaving: false,
    isDeleteDialogOpen: false,
    error: null
  });
  
  const { toast } = useToast();

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
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
      
      setState(prev => {
        const newState = { 
          ...prev, 
          templates: typedTemplates,
          isLoading: false 
        };
        
        if (typedTemplates.length > 0 && !prev.selectedTemplate) {
          newState.selectedTemplate = typedTemplates[0];
        }
        
        return newState;
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'No se pudieron cargar las plantillas. Verifique sus permisos.'
      }));
      
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas',
        variant: 'destructive',
      });
    }
  };

  // Edit template
  const handleEditTemplate = () => {
    if (state.selectedTemplate) {
      setState(prev => ({ 
        ...prev, 
        editedTemplate: { ...prev.selectedTemplate! },
        isEditing: true
      }));
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!state.editedTemplate) return;
    
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({
          name: state.editedTemplate.name,
          content: state.editedTemplate.content,
          category: state.editedTemplate.category,
          language: state.editedTemplate.language,
          variables: convertTemplateVariablesToJson(state.editedTemplate.variables),
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.editedTemplate.id);
      
      if (error) throw error;
      
      const updatedTemplate = { 
        ...state.editedTemplate, 
        updated_at: new Date().toISOString() 
      };
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map((t) =>
          t.id === updatedTemplate.id ? updatedTemplate : t
        ),
        selectedTemplate: updatedTemplate,
        isSaving: false,
        isEditing: false
      }));
      
      toast({
        title: 'Plantilla guardada',
        description: 'La plantilla ha sido actualizada correctamente',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        error: 'No se pudo guardar la plantilla. Verifique sus permisos.' 
      }));
      
      toast({
        title: 'Error',
        description: 'No se pudo guardar la plantilla',
        variant: 'destructive',
      });
    }
  };

  // Create template
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
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
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
      
      setState(prev => ({
        ...prev,
        templates: [...prev.templates, newCreatedTemplate],
        selectedTemplate: newCreatedTemplate,
        editedTemplate: newCreatedTemplate,
        isEditing: true,
        isSaving: false
      }));
      
      toast({
        title: 'Plantilla creada',
        description: 'Se ha creado una nueva plantilla',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        error: 'No se pudo crear la plantilla. Verifique sus permisos.' 
      }));
      
      toast({
        title: 'Error',
        description: 'No se pudo crear la plantilla',
        variant: 'destructive',
      });
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!state.selectedTemplate) return;
    
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', state.selectedTemplate!.id);
      
      if (error) throw error;
      
      const updatedTemplates = state.templates.filter((t) => t.id !== state.selectedTemplate!.id);
      
      setState(prev => {
        const newState = {
          ...prev,
          templates: updatedTemplates,
          isSaving: false,
          isDeleteDialogOpen: false
        };
        
        if (updatedTemplates.length > 0) {
          newState.selectedTemplate = updatedTemplates[0];
        } else {
          newState.selectedTemplate = null;
        }
        
        return newState;
      });
      
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla ha sido eliminada correctamente',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        error: 'No se pudo eliminar la plantilla. Verifique sus permisos.' 
      }));
      
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la plantilla',
        variant: 'destructive',
      });
    }
  };

  // Variable management
  const handleAddVariable = () => {
    if (!state.editedTemplate) return;
    
    const newVariable: TemplateVariable = {
      name: `variable${state.editedTemplate.variables.length + 1}`,
      type: 'text',
      example: 'Ejemplo',
    };
    
    setState(prev => ({
      ...prev,
      editedTemplate: {
        ...prev.editedTemplate!,
        variables: [...prev.editedTemplate!.variables, newVariable],
        content: `${prev.editedTemplate!.content} {{${newVariable.name}}}`,
      }
    }));
  };

  const handleVariableChange = (index: number, field: keyof TemplateVariable, value: string) => {
    if (!state.editedTemplate) return;
    
    const updatedVariables = [...state.editedTemplate.variables];
    
    if (field === 'name' && updatedVariables[index]) {
      const oldName = updatedVariables[index].name;
      const newContent = state.editedTemplate.content.replace(
        `{{${oldName}}}`,
        `{{${value}}}`
      );
      setState(prev => ({
        ...prev,
        editedTemplate: {
          ...prev.editedTemplate!,
          content: newContent,
        }
      }));
    }
    
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    
    setState(prev => ({
      ...prev,
      editedTemplate: {
        ...prev.editedTemplate!,
        variables: updatedVariables,
      }
    }));
  };

  const handleRemoveVariable = (index: number) => {
    if (!state.editedTemplate) return;
    
    const variableName = state.editedTemplate.variables[index].name;
    const updatedVariables = state.editedTemplate.variables.filter((_, i) => i !== index);
    const updatedContent = state.editedTemplate.content.replace(`{{${variableName}}}`, '');
    
    setState(prev => ({
      ...prev,
      editedTemplate: {
        ...prev.editedTemplate!,
        variables: updatedVariables,
        content: updatedContent,
      }
    }));
  };

  const handleEditFieldChange = (field: keyof MessageTemplate, value: string) => {
    if (!state.editedTemplate) return;
    
    setState(prev => ({
      ...prev,
      editedTemplate: {
        ...prev.editedTemplate!,
        [field]: value,
      }
    }));
  };

  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      editedTemplate: null
    }));
  };

  const setSelectedTemplate = (template: MessageTemplate | null) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template
    }));
  };

  const setIsDeleteDialogOpen = (isOpen: boolean) => {
    setState(prev => ({
      ...prev,
      isDeleteDialogOpen: isOpen
    }));
  };

  return {
    templates: state.templates,
    selectedTemplate: state.selectedTemplate,
    setSelectedTemplate,
    isLoading: state.isLoading,
    isEditing: state.isEditing,
    editedTemplate: state.editedTemplate,
    isSaving: state.isSaving,
    isDeleteDialogOpen: state.isDeleteDialogOpen,
    error: state.error,
    setIsDeleteDialogOpen,
    handleEditTemplate,
    handleSaveTemplate,
    handleCreateTemplate,
    handleDeleteTemplate,
    handleAddVariable,
    handleVariableChange,
    handleRemoveVariable,
    handleEditFieldChange,
    handleCancelEdit,
  };
};
