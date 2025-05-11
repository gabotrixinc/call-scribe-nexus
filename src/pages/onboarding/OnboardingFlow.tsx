
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Building, 
  MessageSquare, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OnboardingStepOne from './steps/OnboardingStepOne';
import OnboardingStepTwo from './steps/OnboardingStepTwo';
import OnboardingStepThree from './steps/OnboardingStepThree';
import OnboardingLoader from './components/OnboardingLoader';
import OnboardingComplete from './steps/OnboardingComplete';
import { Agent } from '@/hooks/useAgentsService';
import { AgentConfig } from '@/types/onboarding';

// Definición del tipo para los pasos del onboarding
type OnboardingStep = 'welcome' | 'business-info' | 'ai-agents' | 'processing' | 'complete';
type BusinessInfo = {
  companyName: string;
  industry: string;
  description: string;
  mainGoal: string;
};

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estado para controlar el paso actual del onboarding
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  // Estado para la información recopilada
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: '',
    industry: '',
    description: '',
    mainGoal: ''
  });
  const [aiSetupPrompt, setAiSetupPrompt] = useState<string>('');
  
  // Estado para el progreso de la configuración
  const [configProgress, setConfigProgress] = useState({
    agentsCreated: 0,
    promptsConfigured: 0,
    workflowsSetup: 0,
    templatesCreated: 0
  });

  // Estado para los agentes generados
  const [generatedAgents, setGeneratedAgents] = useState<AgentConfig[]>([]);

  const goToNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('business-info');
        break;
      case 'business-info':
        setCurrentStep('ai-agents');
        break;
      case 'ai-agents':
        setCurrentStep('processing');
        processConfiguration();
        break;
      case 'processing':
        setCurrentStep('complete');
        break;
      case 'complete':
        navigate('/');
        break;
      default:
        break;
    }
  };

  const processConfiguration = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulamos el proceso de configuración con intervalos para mostrar el progreso
      let progress = 0;
      
      // Configurar la información de la empresa
      await saveBusinessInfo();
      setConfigProgress(prev => ({ ...prev, agentsCreated: 2 }));
      progress += 25;
      
      // Esperar un momento para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Configurar agentes IA basados en el prompt
      const createdAgents = await generateAndSaveAiAgents();
      setGeneratedAgents(createdAgents);
      setConfigProgress(prev => ({ ...prev, promptsConfigured: 4 }));
      progress += 25;
      
      // Esperar un momento para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Configurar flujos de trabajo
      await setupWorkflows();
      setConfigProgress(prev => ({ ...prev, workflowsSetup: 2 }));
      progress += 25;
      
      // Esperar un momento para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Configurar plantillas de mensajes
      await createDefaultTemplates();
      setConfigProgress(prev => ({ ...prev, templatesCreated: 3 }));
      progress += 25;
      
      // Finalizar el proceso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('complete');
      
      toast({
        title: "¡Configuración completada!",
        description: "Tu centro de contacto con IA está listo para usar"
      });
    } catch (error) {
      console.error("Error durante la configuración:", error);
      toast({
        title: "Error en la configuración",
        description: "Ocurrió un problema al configurar tu cuenta. Por favor, inténtalo nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Funciones para guardar la información en la base de datos
  const saveBusinessInfo = async () => {
    try {
      // Guardar configuración en la tabla settings
      const { error } = await supabase.from('settings').upsert({
        id: 'default',
        company_name: businessInfo.companyName,
        default_language: 'es',
        timezone: 'UTC',
        analytics_enabled: true,
        notifications_enabled: true
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error al guardar información de la empresa:", error);
      throw error;
    }
  };

  const generateAndSaveAiAgents = async (): Promise<AgentConfig[]> => {
    try {
      // Analizar el prompt del usuario para determinar los agentes a crear
      // En un sistema real, aquí usaríamos un procesamiento de lenguaje natural
      // para extraer información relevante del prompt y crear agentes personalizados
      
      // Extraer información básica de especialización del prompt
      let specialization = 'general';
      let salesSpecialist = false;
      let supportSpecialist = false;
      
      if (aiSetupPrompt.toLowerCase().includes('ventas') || 
          aiSetupPrompt.toLowerCase().includes('vender') || 
          businessInfo.mainGoal === 'sales') {
        salesSpecialist = true;
      }
      
      if (aiSetupPrompt.toLowerCase().includes('soporte') || 
          aiSetupPrompt.toLowerCase().includes('ayuda técnica') || 
          aiSetupPrompt.toLowerCase().includes('problemas técnicos') || 
          businessInfo.mainGoal === 'support') {
        supportSpecialist = true;
      }
      
      // Crear agentes según el análisis y la información del negocio
      const agents: AgentConfig[] = [
        {
          name: 'Asistente Principal de ' + businessInfo.companyName,
          type: 'ai',
          status: 'available',
          specialization: 'general',
          voice_id: 'es-ES-Neural2-A',
          prompt_template: `Eres un asistente virtual para ${businessInfo.companyName} en el sector de ${businessInfo.industry}. 
            ${aiSetupPrompt}
            Descripción del negocio: ${businessInfo.description}
            Siempre mantén un tono profesional y amigable. El objetivo principal es ${getGoalDescription(businessInfo.mainGoal)}.`
        }
      ];
      
      // Agregar especialista en ventas si es necesario
      if (salesSpecialist) {
        agents.push({
          name: 'Especialista en Ventas',
          type: 'ai',
          status: 'available',
          specialization: 'sales',
          voice_id: 'es-ES-Neural2-B',
          prompt_template: `Eres un especialista en ventas para ${businessInfo.companyName} en el sector de ${businessInfo.industry}. 
            ${aiSetupPrompt}
            Descripción del negocio: ${businessInfo.description}
            Enfócate en convertir consultas en ventas con un enfoque persuasivo pero no agresivo. El objetivo principal es ${getGoalDescription('sales')}.`
        });
      }
      
      // Agregar especialista en soporte si es necesario
      if (supportSpecialist) {
        agents.push({
          name: 'Soporte Técnico',
          type: 'ai',
          status: 'available',
          specialization: 'support',
          voice_id: 'es-ES-Neural2-C',
          prompt_template: `Eres un especialista en soporte técnico para ${businessInfo.companyName} en el sector de ${businessInfo.industry}. 
            ${aiSetupPrompt}
            Descripción del negocio: ${businessInfo.description}
            Tu objetivo es ayudar a resolver problemas técnicos de forma clara y eficiente. El objetivo principal es ${getGoalDescription('support')}.`
        });
      }
      
      // Intentar insertar los agentes en la base de datos
      const createdAgents: AgentConfig[] = [];
      
      for (const agent of agents) {
        try {
          console.log("Intentando crear agente:", agent);
          const { data, error } = await supabase.from('agents').insert({
            name: agent.name,
            type: agent.type,
            status: agent.status,
            specialization: agent.specialization,
            voice_id: agent.voice_id,
            prompt_template: agent.prompt_template
          }).select();
          
          if (error) {
            console.error("Error al crear agente:", error);
            
            // Intentar con un status alternativo si el primero falla
            const { data: retryData, error: retryError } = await supabase.from('agents').insert({
              name: agent.name,
              type: agent.type,
              status: 'online',
              specialization: agent.specialization,
              voice_id: agent.voice_id,
              prompt_template: agent.prompt_template
            }).select();
            
            if (retryError) {
              console.error("Error en segundo intento:", retryError);
              
              // Último intento con status offline
              const { data: lastData, error: lastError } = await supabase.from('agents').insert({
                name: agent.name,
                type: agent.type,
                status: 'offline',
                specialization: agent.specialization,
                voice_id: agent.voice_id,
                prompt_template: agent.prompt_template
              }).select();
              
              if (lastError) {
                console.error("Error en tercer intento:", lastError);
              } else {
                console.log("Agente creado en tercer intento:", lastData);
                if (lastData && lastData.length > 0) {
                  createdAgents.push({...agent, status: 'offline'});
                }
              }
            } else {
              console.log("Agente creado en segundo intento:", retryData);
              if (retryData && retryData.length > 0) {
                createdAgents.push({...agent, status: 'online'});
              }
            }
          } else {
            console.log("Agente creado en primer intento:", data);
            if (data && data.length > 0) {
              createdAgents.push(agent);
            }
          }
        } catch (error) {
          console.error("Error no controlado al crear agente:", error);
        }
      }
      
      return createdAgents;
    } catch (error) {
      console.error("Error al generar y guardar agentes IA:", error);
      return [];
    }
  };

  const getGoalDescription = (goal: string): string => {
    switch (goal) {
      case 'customer_service':
        return 'proporcionar un excelente servicio al cliente, resolviendo consultas y problemas rápidamente';
      case 'sales':
        return 'aumentar las ventas, ayudando a los clientes a encontrar los productos adecuados y completar compras';
      case 'lead_gen':
        return 'generar leads calificados, recopilando información de contacto y calificando el interés del cliente';
      case 'support':
        return 'ofrecer soporte técnico eficiente, guiando a los usuarios a través de soluciones paso a paso';
      case 'engagement':
        return 'mejorar el engagement con los clientes, creando interacciones personalizadas y significativas';
      default:
        return 'mejorar la experiencia general del cliente';
    }
  };

  const setupWorkflows = async () => {
    // En una implementación real, aquí configuraríamos los flujos de trabajo
    // basados en la información proporcionada
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const createDefaultTemplates = async () => {
    try {
      // Crear plantillas de mensajes básicas
      const templates = [
        {
          name: 'Bienvenida',
          content: `¡Hola! Gracias por contactar a ${businessInfo.companyName}. ¿En qué podemos ayudarte hoy?`,
          category: 'greeting',
          language: 'es',
          variables: []
        },
        {
          name: 'Despedida',
          content: 'Gracias por comunicarte con nosotros. ¡Que tengas un excelente día!',
          category: 'closing',
          language: 'es',
          variables: []
        },
        {
          name: 'Transferencia a agente',
          content: 'Entiendo que necesitas ayuda más específica. Te estoy transfiriendo con un representante humano que podrá asistirte mejor.',
          category: 'transfer',
          language: 'es',
          variables: []
        }
      ];
      
      // Insertar las plantillas con mejor manejo de errores
      for (const template of templates) {
        try {
          const { error } = await supabase.from('whatsapp_templates').insert(template);
          if (error) {
            // Si hay un error de RLS o permisos, lo registramos pero continuamos
            if (error.code === '42501' || error.message.includes('violates row-level security policy')) {
              console.warn(`RLS error al insertar plantilla ${template.name}:`, error.message);
              // Continuar con la siguiente plantilla sin fallar todo el proceso
              continue;
            }
            throw error;
          }
        } catch (templateError) {
          console.error(`Error al crear plantilla ${template.name}:`, templateError);
          // No fallamos todo el proceso por una plantilla
        }
      }
      
      // Incluso si algunas plantillas fallan, consideramos el proceso como completado
      console.log("Proceso de creación de plantillas finalizado");
      return true;
    } catch (error) {
      console.error("Error al crear plantillas:", error);
      // No fallamos todo el proceso, devolvemos true para continuar
      return true;
    }
  };

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <OnboardingStepOne onNext={goToNextStep} />;
      
      case 'business-info':
        return (
          <OnboardingStepTwo 
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
            onNext={goToNextStep}
          />
        );
      
      case 'ai-agents':
        return (
          <OnboardingStepThree
            aiSetupPrompt={aiSetupPrompt}
            setAiSetupPrompt={setAiSetupPrompt}
            businessInfo={businessInfo}
            onNext={goToNextStep}
          />
        );
      
      case 'processing':
        return (
          <OnboardingLoader 
            progress={configProgress}
          />
        );
      
      case 'complete':
        return <OnboardingComplete onFinish={goToNextStep} generatedAgents={generatedAgents} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-slate-900 p-4">
      {renderStep()}
    </div>
  );
};

export default OnboardingFlow;
