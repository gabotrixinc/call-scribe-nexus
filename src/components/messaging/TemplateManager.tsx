
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTemplates } from '@/hooks/useTemplates';
import { MessageTemplate } from '@/types/messaging';
import TemplateList from './templates/TemplateList';
import TemplateContent from './templates/TemplateContent';
import DeleteTemplateDialog from './templates/DeleteTemplateDialog';
import TemplateActions from './templates/TemplateActions';

const TemplateManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
  
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

  // Update filtered templates when templates change
  React.useEffect(() => {
    handleFilterTemplates(searchTerm, activeCategory);
  }, [templates, activeCategory]);

  const handleFilterTemplates = (term: string, category: string) => {
    const filtered = templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(term.toLowerCase()) ||
        template.content.toLowerCase().includes(term.toLowerCase());
      
      const matchesCategory = category === 'all' || template.category === category;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredTemplates(filtered);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    handleFilterTemplates(term, activeCategory);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    handleFilterTemplates(searchTerm, category);
  };

  return (
    <div className="space-y-6">
      <TemplateActions onCreateTemplate={handleCreateTemplate} />
      
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
          onCreate={handleCreateTemplate}
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
