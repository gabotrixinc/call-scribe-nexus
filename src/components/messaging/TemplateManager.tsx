import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Edit, Trash2, Clock, Send, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface TemplateVariable {
  name: string;
  type: 'text' | 'currency' | 'date_time';
  example: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  language: string;
  variables: TemplateVariable[];
  created_at: string;
  updated_at: string;
}

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
        
        setTemplates(data || []);
        if (data && data.length > 0) {
          setSelectedTemplate(data[0]);
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

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
          variables: editedTemplate.variables,
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
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTemplates([...templates, data]);
      setSelectedTemplate(data);
      setEditedTemplate(data);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Plantillas de Mensajes</h3>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <ScrollArea className="h-[500px] border rounded-md">
              {filteredTemplates.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No se encontraron plantillas
                </div>
              ) : (
                filteredTemplates.map((template) => (
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
        </div>
        
        <Card className="md:col-span-2">
          {selectedTemplate ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <CardDescription>
                      {getStatusBadge(selectedTemplate.status)}
                      <span className="ml-2">
                        Última actualización:{' '}
                        {new Date(selectedTemplate.updated_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditing && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEditTemplate}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing && editedTemplate ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Nombre de la plantilla</Label>
                      <Input
                        id="template-name"
                        value={editedTemplate.name}
                        onChange={(e) =>
                          setEditedTemplate({
                            ...editedTemplate,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="template-category">Categoría</Label>
                      <Input
                        id="template-category"
                        value={editedTemplate.category}
                        onChange={(e) =>
                          setEditedTemplate({
                            ...editedTemplate,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="template-content">Contenido</Label>
                      <Textarea
                        id="template-content"
                        value={editedTemplate.content}
                        onChange={(e) =>
                          setEditedTemplate({
                            ...editedTemplate,
                            content: e.target.value,
                          })
                        }
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {{variable}} para definir variables que se pueden reemplazar.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Variables</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddVariable}
                          className="h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Agregar variable
                        </Button>
                      </div>
                      
                      {editedTemplate.variables.length > 0 ? (
                        <div className="space-y-4">
                          {editedTemplate.variables.map((variable, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2 items-center">
                              <Input
                                value={variable.name}
                                onChange={(e) =>
                                  handleVariableChange(index, 'name', e.target.value)
                                }
                                placeholder="Nombre"
                              />
                              <Input
                                value={variable.example}
                                onChange={(e) =>
                                  handleVariableChange(index, 'example', e.target.value)
                                }
                                placeholder="Ejemplo"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleRemoveVariable(index)}
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
                    
                    <div className="flex space-x-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditedTemplate(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveTemplate} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Categoría</h4>
                      <p>{selectedTemplate.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Contenido</h4>
                      <div className="p-3 border rounded-md whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Variables</h4>
                      {selectedTemplate.variables && selectedTemplate.variables.length > 0 ? (
                        <div className="grid gap-2 grid-cols-2">
                          {selectedTemplate.variables.map((variable, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 border rounded-md"
                            >
                              <div>
                                <span className="font-mono text-sm">
                                  {`{{${variable.name}}}`}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  Ejemplo: {variable.example}
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
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="ml-auto">
                        <Send className="h-4 w-4 mr-2" /> Probar envío
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center p-12 text-center">
              <div>
                <h3 className="font-medium">No hay plantilla seleccionada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Seleccione una plantilla de la lista o cree una nueva.
                </p>
                <Button className="mt-4" onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta plantilla? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager;
