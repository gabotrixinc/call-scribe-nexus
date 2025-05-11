
import React, { useState } from 'react';
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
      await generateAndSaveAiAgents();
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

  const generateAndSaveAiAgents = async () => {
    try {
      // Crear agentes básicos según el prompt proporcionado
      // En un sistema real, aquí usaríamos un procesamiento de lenguaje natural
      // para extraer información relevante del prompt y crear agentes personalizados
      
      // Para este ejemplo, creamos agentes por defecto
      const agents = [
        {
          name: 'Asistente Principal',
          type: 'ai',
          status: 'active',
          specialization: 'general',
          voice_id: 'es-ES-Neural2-A',
          prompt_template: `Eres un asistente virtual para ${businessInfo.companyName} en el sector de ${businessInfo.industry}. 
            ${aiSetupPrompt}
            Siempre mantén un tono profesional y amigable.`
        },
        {
          name: 'Especialista en Ventas',
          type: 'ai',
          status: 'active',
          specialization: 'sales',
          voice_id: 'es-ES-Neural2-B',
          prompt_template: `Eres un especialista en ventas para ${businessInfo.companyName} en el sector de ${businessInfo.industry}. 
            ${aiSetupPrompt}
            Enfócate en convertir consultas en ventas con un enfoque persuasivo pero no agresivo.`
        }
      ];
      
      // Insertar los agentes en la base de datos
      for (const agent of agents) {
        const { error } = await supabase.from('agents').insert(agent);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error al generar y guardar agentes IA:", error);
      throw error;
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
      
      // Insertar las plantillas en la base de datos
      for (const template of templates) {
        const { error } = await supabase.from('whatsapp_templates').insert(template);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error al crear plantillas:", error);
      throw error;
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
        return <OnboardingComplete onFinish={goToNextStep} />;
      
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
