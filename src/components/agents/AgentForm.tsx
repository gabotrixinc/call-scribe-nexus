
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Agent, useAgentsService } from '@/hooks/useAgentsService';

interface AgentFormProps {
  open: boolean;
  onClose: () => void;
  editingAgent?: Agent;
}

interface AgentFormValues {
  name: string;
  type: 'ai' | 'human';
  status: 'available' | 'busy' | 'offline';
  specialization: string;
  voice_id?: string;
  prompt_template?: string;
}

const AgentForm: React.FC<AgentFormProps> = ({ open, onClose, editingAgent }) => {
  const { createAgent } = useAgentsService();
  const form = useForm<AgentFormValues>({
    defaultValues: {
      name: editingAgent?.name || '',
      type: editingAgent?.type || 'ai',
      status: editingAgent?.status || 'available',
      specialization: editingAgent?.specialization || '',
      voice_id: editingAgent?.voice_id || '',
      prompt_template: editingAgent?.prompt_template || '',
    },
  });

  const onSubmit = async (values: AgentFormValues) => {
    await createAgent({
      name: values.name,
      type: values.type,
      status: values.status,
      specialization: values.specialization || null,
      voice_id: values.voice_id || null,
      prompt_template: values.prompt_template || null,
    });
    
    onClose();
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingAgent ? 'Editar agente' : 'Crear nuevo agente'}
          </DialogTitle>
          <DialogDescription>
            {editingAgent
              ? 'Actualiza los datos del agente existente'
              : 'Ingresa la información para el nuevo agente'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "El nombre es obligatorio" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del agente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              rules={{ required: "El tipo es obligatorio" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de agente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="human">Humano</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              rules={{ required: "El estado es obligatorio" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">Ocupado</SelectItem>
                      <SelectItem value="offline">Desconectado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialización</FormLabel>
                  <FormControl>
                    <Input placeholder="Especialización del agente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('type') === 'ai' && (
              <>
                <FormField
                  control={form.control}
                  name="voice_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID de Voz</FormLabel>
                      <FormControl>
                        <Input placeholder="ID de Voz (ej. en-US-Standard-F)" {...field} />
                      </FormControl>
                      <FormDescription>El identificador de voz para Text-to-Speech</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prompt_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla de prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Template para el prompt del AI" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>La plantilla para guiar las respuestas del AI</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAgent ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentForm;
