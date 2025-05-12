
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentConfig, BusinessInfo } from '@/types/onboarding';
import { Loader2, Bot, UserCircle, Check } from 'lucide-react';
import { useOnboardingAgents } from '@/hooks/onboarding/useOnboardingAgents';

function getAgentConfigsFromBusinessInfo(businessInfo: BusinessInfo, aiPrompt: string): AgentConfig[] {
  // Create a set of specialized agents based on business info and AI prompt
  const agents: AgentConfig[] = [];
  
  // Start with a generic customer service agent
  agents.push({
    name: `Asistente de ${businessInfo.companyName}`,
    type: 'ai',
    status: 'available', 
    specialization: 'Atención al Cliente',
    prompt_template: `Como asistente de ${businessInfo.companyName}, una empresa en el sector ${businessInfo.industry}, tu rol es ${businessInfo.mainGoal}. ${aiPrompt}`,
  });
  
  // Add industry-specific agents
  if (businessInfo.industry.toLowerCase().includes('ventas') || 
      businessInfo.industry.toLowerCase().includes('comercial') ||
      businessInfo.mainGoal.toLowerCase().includes('vender')) {
    agents.push({
      name: `Agente de Ventas de ${businessInfo.companyName}`,
      type: 'ai',
      status: 'available',
      specialization: 'Ventas',
      prompt_template: `Eres un experto en ventas de ${businessInfo.companyName}. Tu objetivo es ayudar a convertir consultas en ventas, explicando las ventajas de nuestros productos o servicios. ${businessInfo.description} ${aiPrompt}`,
    });
  }

  if (businessInfo.industry.toLowerCase().includes('soporte') || 
      businessInfo.industry.toLowerCase().includes('técnic') ||
      businessInfo.mainGoal.toLowerCase().includes('asistencia') ||
      businessInfo.mainGoal.toLowerCase().includes('ayuda')) {
    agents.push({
      name: `Soporte Técnico de ${businessInfo.companyName}`,
      type: 'ai',
      status: 'available',
      specialization: 'Soporte Técnico',
      prompt_template: `Eres el soporte técnico de ${businessInfo.companyName}. Tu objetivo es resolver problemas técnicos y proporcionar asistencia detallada. ${businessInfo.description} ${aiPrompt}`,
    });
  }
  
  // Add a human agent as supervisor
  agents.push({
    name: 'Supervisor',
    type: 'human',
    status: 'available',
    specialization: 'Supervisión y Escalamiento',
  });
  
  return agents;
}

interface OnboardingGenerateAgentsProps {
  businessInfo: BusinessInfo | null;
  aiPrompt: string | null;
  onAgentsGenerated: (agents: AgentConfig[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const OnboardingGenerateAgents: React.FC<OnboardingGenerateAgentsProps> = ({
  businessInfo,
  aiPrompt,
  onAgentsGenerated,
  onBack,
  onNext
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [generatedAgents, setGeneratedAgents] = useState<AgentConfig[]>([]);
  const { createAgentsFromConfig, isCreatingAgents, createdAgents } = useOnboardingAgents();
  
  useEffect(() => {
    // Simulate AI analyzing
    const analyzeTimer = setTimeout(() => {
      if (businessInfo) {
        const agents = getAgentConfigsFromBusinessInfo(businessInfo, aiPrompt || '');
        setGeneratedAgents(agents);
        onAgentsGenerated(agents);
      }
      setIsAnalyzing(false);
    }, 2000);
    
    return () => clearTimeout(analyzeTimer);
  }, [businessInfo, aiPrompt]);
  
  const handleCreateAgents = async () => {
    const createdAgents = await createAgentsFromConfig(generatedAgents);
    if (createdAgents.length > 0) {
      onAgentsGenerated(createdAgents);
      onNext();
    }
  };

  if (!businessInfo) {
    return <div>No se encontró información empresarial</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Agentes Inteligentes</h2>
        <p className="text-muted-foreground">
          Basado en tu información, te recomendamos los siguientes agentes
        </p>
      </div>
      
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Analizando tu información empresarial...</p>
          <p className="text-sm text-muted-foreground">Estamos diseñando los agentes perfectos para tu negocio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generatedAgents.map((agent, index) => (
            <Card key={index}>
              <CardHeader className={`pb-3 ${agent.type === 'ai' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {agent.type === 'ai' ? (
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <UserCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-2">
                  <span className="font-medium">Tipo:</span> {agent.type === 'ai' ? 'Inteligencia Artificial' : 'Humano'}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Especialización:</span> {agent.specialization || 'General'}
                </p>
                {agent.prompt_template && (
                  <div>
                    <p className="text-sm font-medium mb-1">Instrucciones:</p>
                    <p className="text-xs text-muted-foreground border p-2 rounded bg-muted/50 max-h-24 overflow-y-auto">
                      {agent.prompt_template}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="pt-6 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isAnalyzing || isCreatingAgents}>
          Atrás
        </Button>
        
        <Button onClick={handleCreateAgents} disabled={isAnalyzing || isCreatingAgents || generatedAgents.length === 0}>
          {isCreatingAgents ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando agentes...
            </>
          ) : createdAgents.length > 0 ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Agentes creados
            </>
          ) : (
            'Crear agentes y continuar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingGenerateAgents;
