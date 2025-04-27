
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountryCodeSelect from './CountryCodeSelect';

interface CallFormData {
  phoneNumber: string;
  callerName?: string;
  agentId?: string;
}

interface CallFormProps {
  onSubmit: (data: CallFormData) => Promise<void>;
  isCallInProgress: boolean;
  countryCode: string;
  setCountryCode: (code: string) => void;
  availableAgents: Array<{ id: string; name: string; type: string }>;
}

const CallForm: React.FC<CallFormProps> = ({ 
  onSubmit, 
  isCallInProgress, 
  countryCode, 
  setCountryCode,
  availableAgents
}) => {
  const form = useForm<CallFormData>({
    defaultValues: {
      phoneNumber: '',
      callerName: '',
      agentId: 'auto',
    }
  });

  return (
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
  );
};

export default CallForm;
