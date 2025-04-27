
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import { useAgentsService } from '@/hooks/useAgentsService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneDialpad from './Dialpad';
import { useToast } from '@/components/ui/use-toast';
import CallForm from './CallForm';
import CountryCodeSelect from './CountryCodeSelect';

const CallMaker: React.FC = () => {
  const { startCall } = useCallsService();
  const { agents } = useAgentsService();
  const { toast } = useToast();
  
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+34'); // Default to Spain
  
  const onSubmitForm = async (data: {
    phoneNumber: string;
    callerName?: string;
    agentId?: string;
  }) => {
    if (!data.phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'El número de teléfono es obligatorio',
        variant: 'destructive'
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
      
      setPhoneNumber('');
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
            <CallForm 
              onSubmit={onSubmitForm}
              isCallInProgress={isCallInProgress}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              availableAgents={availableAgents}
            />
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
