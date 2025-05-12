import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, User, Clock } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import { useAgentsService } from '@/hooks/useAgentsService';
import { useToast } from '@/components/ui/use-toast';
import PhoneDialpad from './Dialpad';
import CountryCodeSelect from './CountryCodeSelect';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const CallMaker: React.FC = () => {
  const { startCall } = useCallsService();
  const { agents } = useAgentsService();
  const { toast } = useToast();
  
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+34'); // Default to Spain
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  
  const availableAgents = agents?.filter(agent => agent.status === 'available') || [];
  
  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'El número de teléfono es obligatorio',
        variant: 'destructive'
      });
      return;
    }

    let fullNumber = phoneNumber;
    
    // Si el número no comienza con +, agregar código de país
    if (!phoneNumber.startsWith('+')) {
      fullNumber = `${countryCode}${phoneNumber}`;
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
      // Find default agent if none selected
      const agentId = selectedAgentId || availableAgents[0]?.id;
      
      if (!agentId) {
        toast({
          title: 'No hay agentes disponibles',
          description: 'No se puede realizar la llamada sin un agente disponible',
          variant: 'destructive'
        });
        setIsCallInProgress(false);
        return;
      }
      
      const callData = {
        caller_number: fullNumber,
        caller_name: null,
        ai_agent_id: agentId,
        start_time: new Date().toISOString(),
      };
      
      await startCall.mutateAsync(callData);
      
      // Automatically add this number to contacts if it's new
      try {
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('phone', fullNumber)
          .maybeSingle();
          
        if (!existingContact) {
          await supabase.from('contacts').insert({
            name: `Contact ${fullNumber}`,
            phone: fullNumber,
            last_contact: new Date().toISOString()
          });
        } else {
          await supabase
            .from('contacts')
            .update({ last_contact: new Date().toISOString() })
            .eq('id', existingContact.id);
        }
      } catch (contactError) {
        console.error('Error managing contact:', contactError);
      }
      
      setPhoneNumber('');
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
      toast({
        title: 'Error al iniciar llamada',
        description: error.message || 'No se pudo iniciar la llamada',
        variant: 'destructive'
      });
    } finally {
      setIsCallInProgress(false);
    }
  };

  return (
    <Card className="col-span-full sm:col-span-2 lg:col-span-3 shadow-lg border-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <span>Nueva Llamada</span>
        </CardTitle>
        <CardDescription>Realice una llamada con asistencia de IA</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex gap-2">
            <CountryCodeSelect 
              selectedCode={countryCode}
              onSelect={setCountryCode}
              className="w-[120px] flex-shrink-0"
            />
          </div>
          
          <PhoneDialpad
            value={phoneNumber}
            onChange={setPhoneNumber}
            onCall={handleCall}
            onCancel={() => setPhoneNumber('')}
            isCallInProgress={isCallInProgress}
          />
          
          {availableAgents.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Seleccione un agente:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={cn(
                      "p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-colors",
                      selectedAgentId === agent.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-accent"
                    )}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.type === 'ai' ? 'Asistente IA' : 'Agente Humano'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {availableAgents.length === 0 && (
            <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 p-4 rounded-lg">
              <p className="text-sm">
                No hay agentes disponibles en este momento. Añada o active un agente antes de realizar llamadas.
              </p>
            </div>
          )}
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Programar llamada</p>
                <p className="text-muted-foreground">
                  Disponible próximamente. Podrá programar llamadas para realizarlas en un momento específico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallMaker;
