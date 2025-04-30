
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useTemplates } from '@/hooks/useTemplates';
import { MessageTemplate } from '@/types/messaging';
import TemplateList from './templates/TemplateList';
import TemplateContent from './templates/TemplateContent';
import DeleteTemplateDialog from './templates/DeleteTemplateDialog';
import TemplateActions from './templates/TemplateActions';
import { useToast } from '@/components/ui/use-toast';

const TemplateManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    isLoading,
    isEditing,
    editedTemplate,
    isSaving,
    isDeleteDialogOpen,
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
  } = useTemplates();

  // Extract unique categories
  useEffect(() => {
    if (templates && templates.length > 0) {
      const uniqueCategories = [...new Set(templates.map(t => t.category))];
      setCategories(uniqueCategories.filter(c => c !== null && c !== ''));
    }
  }, [templates]);

  // Update filtered templates when templates change
  useEffect(() => {
    handleFilterTemplates(searchTerm, activeCategory);
  }, [templates, activeCategory, searchTerm]);

  const handleFilterTemplates = (term: string, category: string) => {
    try {
      const filtered = templates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(term.toLowerCase()) ||
          template.content.toLowerCase().includes(term.toLowerCase());
        
        const matchesCategory = category === 'all' || template.category === category;
        
        return matchesSearch && matchesCategory;
      });
      
      setFilteredTemplates(filtered);
    } catch (error) {
      console.error('Error filtering templates:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al filtrar las plantillas',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleTemplateCreate = () => {
    try {
      handleCreateTemplate();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la plantilla. Compruebe los permisos de acceso.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <TemplateActions 
        onCreateTemplate={handleTemplateCreate}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <TemplateList 
            templates={filteredTemplates.length > 0 ? filteredTemplates : templates}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={isLoading}
            activeCategory={activeCategory}
          />
        </div>
        
        <TemplateContent 
          selectedTemplate={selectedTemplate}
          isEditing={isEditing}
          editedTemplate={editedTemplate}
          isSaving={isSaving}
          onEdit={handleEditTemplate}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onSave={handleSaveTemplate}
          onCancel={handleCancelEdit}
          onCreate={handleTemplateCreate}
          onChange={handleEditFieldChange}
          onAddVariable={handleAddVariable}
          onVariableChange={handleVariableChange}
          onRemoveVariable={handleRemoveVariable}
        />
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
