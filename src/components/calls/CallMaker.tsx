
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Phone, 
  Loader2 
} from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import { useAgentsService } from '@/hooks/useAgentsService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface CallFormData {
  phoneNumber: string;
  callerName?: string;
  agentId?: string;
}

const CallMaker: React.FC = () => {
  const { startCall } = useCallsService();
  const { agents } = useAgentsService();
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const form = useForm<CallFormData>({
    defaultValues: {
      phoneNumber: '',
      callerName: '',
      agentId: '',
    }
  });

  const onSubmit = async (data: CallFormData) => {
    if (!data.phoneNumber.trim()) {
      form.setError('phoneNumber', {
        type: 'manual',
        message: 'El número de teléfono es obligatorio'
      });
      return;
    }

    setIsCallInProgress(true);

    try {
      await startCall.mutateAsync({
        caller_number: data.phoneNumber,
        caller_name: data.callerName || null,
        ai_agent_id: data.agentId || null,
        start_time: new Date().toISOString(),
        status: 'active',
      });
      
      form.reset();
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
    } finally {
      setIsCallInProgress(false);
    }
  };

  const availableAgents = agents?.filter(agent => agent.status === 'available') || [];

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <span>Realizar una llamada</span>
        </CardTitle>
        <CardDescription>Iniciar una llamada saliente</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de teléfono</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ej. +34 612 345 678" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="callerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del cliente (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar a agente</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar agente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Auto-asignar</SelectItem>
                      {availableAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.type === 'ai' ? 'IA' : 'Humano'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isCallInProgress}>
              {isCallInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Llamando...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar ahora
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CallMaker;
