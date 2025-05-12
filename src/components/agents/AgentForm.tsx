
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgentsService, Agent } from '@/hooks/useAgentsService';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['ai', 'human']),
  status: z.enum(['available', 'busy', 'offline']),
  specialization: z.string().optional(),
  prompt_template: z.string().optional(),
  voice_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AgentFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Agent>;
  isEditing?: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({ 
  onSuccess, 
  initialData = {},
  isEditing = false
}) => {
  const { createAgent } = useAgentsService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || '',
      type: initialData.type || 'ai',
      status: initialData.status as 'available' | 'busy' | 'offline' || 'available',
      specialization: initialData.specialization || '',
      prompt_template: initialData.prompt_template || '',
      voice_id: initialData.voice_id || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await createAgent.mutateAsync({
        name: data.name,
        type: data.type,
        status: data.status,
        specialization: data.specialization,
        prompt_template: data.prompt_template,
        voice_id: data.voice_id,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ai">IA</SelectItem>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
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
        </div>
        
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialización</FormLabel>
              <FormControl>
                <Input placeholder="Especialización del agente (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("type") === "ai" && (
          <>
            <FormField
              control={form.control}
              name="prompt_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plantilla de Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones para el agente de IA" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="voice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Voz</FormLabel>
                  <FormControl>
                    <Input placeholder="ID de voz para TTS (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Agente' : 'Crear Agente')}
        </Button>
      </form>
    </Form>
  );
};

export default AgentForm;
