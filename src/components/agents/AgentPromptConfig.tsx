
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { useAgentsService } from '@/hooks/useAgentsService';
import { supabase } from '@/integrations/supabase/client';

interface AgentPromptConfigProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
}

interface PromptConfigFormData {
  prompt_template: string;
  voice_id: string;
  example_input: string;
  example_output?: string;
}

const AgentPromptConfig: React.FC<AgentPromptConfigProps> = ({
  open,
  onClose,
  agentId
}) => {
  const { agents } = useAgentsService();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm<PromptConfigFormData>({
    defaultValues: {
      prompt_template: '',
      voice_id: '',
      example_input: 'Hola, necesito ayuda con mi factura mensual.',
    }
  });
  
  useEffect(() => {
    if (agents) {
      const currentAgent = agents.find(a => a.id === agentId);
      if (currentAgent) {
        setAgent(currentAgent);
        setValue('prompt_template', currentAgent.prompt_template || '');
        setValue('voice_id', currentAgent.voice_id || '');
      }
    }
  }, [agents, agentId, setValue]);
  
  const generateExampleResponse = async (input: string, template: string) => {
    setIsProcessing(true);
    
    try {
      // Simular generación de respuesta de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        "Entiendo que tiene una consulta sobre su factura mensual. Sería útil conocer cuál es específicamente su preocupación. ¿Tiene preguntas sobre algún cargo, el total, o la fecha de vencimiento?",
        "Hola, gracias por contactarnos. Con gusto le ayudaré con su factura mensual. ¿Podría proporcionarme más detalles sobre qué aspecto de la factura necesita asistencia?",
        "Claro, estoy aquí para ayudarle con cualquier duda sobre su factura. ¿Podría por favor indicarme su número de cliente y qué información específica está buscando?"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error('Error generando respuesta de ejemplo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar una respuesta de ejemplo',
        variant: 'destructive'
      });
      return '';
    } finally {
      setIsProcessing(false);
    }
  };
  
  const onTestPrompt = async () => {
    const response = await generateExampleResponse(
      watch('example_input'),
      watch('prompt_template')
    );
    
    setValue('example_output', response);
  };
  
  const onSave = async (data: PromptConfigFormData) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          prompt_template: data.prompt_template,
          voice_id: data.voice_id
        })
        .eq('id', agentId);
        
      if (error) throw error;
      
      toast({
        title: 'Configuración guardada',
        description: 'Los ajustes del agente han sido actualizados'
      });
      
      onClose();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configurar Agente IA</DialogTitle>
          <DialogDescription>
            {agent?.name ? `Configurando prompt para ${agent.name}` : 'Cargando...'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt_template">Plantilla de Prompt</Label>
            <Textarea 
              id="prompt_template"
              placeholder="Template para guiar las respuestas del asistente"
              className="min-h-[150px] font-mono text-sm"
              {...register('prompt_template')}
            />
            <p className="text-xs text-muted-foreground">
              Usa variables como {`{{user_name}}`}, {`{{context}}`}, etc. para personalizar las respuestas.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voice_id">ID de Voz</Label>
            <Input 
              id="voice_id"
              placeholder="ID de la voz para Text-to-Speech (ej. es-ES-Neural2-A)"
              {...register('voice_id')}
            />
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Probar Prompt</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="example_input">Entrada de prueba</Label>
                <Textarea 
                  id="example_input"
                  placeholder="Ingresa un ejemplo de mensaje de usuario para probar"
                  className="min-h-[80px]"
                  {...register('example_input')}
                />
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={onTestPrompt}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Generar respuesta de prueba'}
              </Button>
              
              {watch('example_output') && (
                <div className="space-y-2 border p-4 rounded-md bg-muted/50">
                  <Label>Respuesta generada:</Label>
                  <p className="text-sm">{watch('example_output')}</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar configuración
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentPromptConfig;
