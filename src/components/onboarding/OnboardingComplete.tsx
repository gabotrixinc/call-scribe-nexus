
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { useRouter } from 'next/router';
import { AgentConfig } from '@/types/onboarding';

interface OnboardingCompleteProps {
  createdAgents: AgentConfig[];
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  createdAgents
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">¡Configuración Completada!</h2>
        <p className="text-muted-foreground">
          Tu plataforma está lista para usar con la configuración que has elegido
        </p>
      </div>
      
      <div className="grid gap-4 w-full max-w-md">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes Configurados
          </h3>
          <div className="mt-3 space-y-2">
            {createdAgents.length > 0 ? (
              createdAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-blue-900/10 rounded">
                  <div className="flex items-center gap-2">
                    {agent.type === 'ai' ? (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Bot className="h-4 w-4 text-blue-500" />
                    )}
                    <span>{agent.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    agent.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    agent.status === 'busy' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {agent.status === 'available' ? 'Disponible' : 
                     agent.status === 'busy' ? 'Ocupado' : 'Desconectado'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No se configuraron agentes durante el onboarding.</p>
            )}
          </div>
          <div className="mt-2 pt-2 border-t">
            <Button 
              variant="link" 
              className="text-sm text-blue-600 dark:text-blue-400 p-0 h-auto"
              onClick={() => router.push('/agents')}
            >
              Ver todos los agentes <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="pt-4 space-y-4 w-full max-w-md">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => router.push('/dashboard')}
        >
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
};

export default OnboardingComplete;
