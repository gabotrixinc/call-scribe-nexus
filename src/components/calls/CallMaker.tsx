import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Phone, 
  Loader2,
  Phone as DialpadIcon 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneDialpad from './Dialpad';
import CountryCodeSelect from './CountryCodeSelect';
import { useToast } from '@/components/ui/use-toast';

interface CallFormData {
  phoneNumber: string;
  callerName?: string;
  agentId?: string;
}

const CallMaker: React.FC = () => {
  const { startCall } = useCallsService();
  const { agents } = useAgentsService();
  const { toast } = useToast();
  
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [dialpadOpen, setDialpadOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+34'); // Default to Spain
  
  const form = useForm<CallFormData>({
    defaultValues: {
      phoneNumber: '',
      callerName: '',
      agentId: 'auto',
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

    await makeCall(data.phoneNumber, data.callerName, data.agentId);
  };
  
  const makeCall = async (number: string, callerName?: string, agentId?: string) => {
    let fullNumber = number;
    
    // Si el número no comienza con +, agregar código de país
    if (!number.startsWith('+')) {
      fullNumber = `${countryCode}${number}`;
    }
    
    // Validar formato básico
    if (!/^\+\d{8,15}$/.test(fullNumber)) {
      toast({
        title: 'Número inválido',
        description: 'Por favor ingrese un número de teléfono válido',
        variant: 'destructive'
      });
      return;
    }
    
    setIsCallInProgress(true);

    try {
      await startCall.mutateAsync({
        caller_number: fullNumber,
        caller_name: callerName || null,
        ai_agent_id: agentId === 'auto' ? null : agentId,
        start_time: new Date().toISOString(),
      });
      
      form.reset();
      setPhoneNumber('');
      setDialpadOpen(false);
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
    } finally {
      setIsCallInProgress(false);
    }
  };
  
  const handleDialpadCall = () => {
    if (!phoneNumber.trim()) return;
    
    makeCall(phoneNumber);
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
        <Tabs defaultValue="form">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="dialpad">Teclado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de teléfono</FormLabel>
                      <div className="flex gap-2">
                        <CountryCodeSelect 
                          selectedCode={countryCode}
                          onSelect={setCountryCode}
                        />
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="612 345 678" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
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
                          <SelectItem value="auto">Auto-asignar</SelectItem>
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
          </TabsContent>
          
          <TabsContent value="dialpad">
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <CountryCodeSelect 
                  selectedCode={countryCode}
                  onSelect={setCountryCode}
                />
              </div>
              
              <PhoneDialpad
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCall={handleDialpadCall}
                onCancel={() => setPhoneNumber('')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CallMaker;
