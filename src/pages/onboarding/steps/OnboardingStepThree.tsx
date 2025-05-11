
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessInfo {
  companyName: string;
  industry: string;
  description: string;
  mainGoal: string;
}

interface OnboardingStepThreeProps {
  aiSetupPrompt: string;
  setAiSetupPrompt: React.Dispatch<React.SetStateAction<string>>;
  businessInfo: BusinessInfo;
  onNext: () => void;
}

const OnboardingStepThree: React.FC<OnboardingStepThreeProps> = ({
  aiSetupPrompt,
  setAiSetupPrompt,
  businessInfo,
  onNext
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDefaultPrompt = () => {
    setIsGenerating(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      const defaultPrompt = `Quiero crear agentes de IA para ${businessInfo.companyName}, una empresa en el sector de ${businessInfo.industry}. 
      
Descripción del negocio: ${businessInfo.description}

Los agentes de IA deben poder:
1. Responder consultas frecuentes sobre nuestros productos y servicios
2. Ayudar a los clientes a resolver problemas comunes
3. Recopilar información importante de los clientes
4. Transferir a un agente humano cuando sea necesario

El tono de comunicación debe ser profesional pero amigable, reflejando los valores de nuestra marca. El objetivo principal es ${getGoalDescription(businessInfo.mainGoal)}.`;

      setAiSetupPrompt(defaultPrompt);
      setIsGenerating(false);
    }, 1500);
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

  const validateForm = () => {
    if (!aiSetupPrompt.trim() || aiSetupPrompt.trim().length < 20) {
      setError('Por favor, proporciona instrucciones más detalladas para tus agentes de IA');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="border-0 bg-black/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full flex justify-center mb-5"
          >
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-300 text-transparent bg-clip-text">
            Configura tus agentes IA
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Describe cómo quieres que funcionen tus agentes virtuales
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6 space-y-6">
          <div className="rounded-lg border p-4 bg-black/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Información de tu empresa</h4>
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-400 space-y-1">
              <p><span className="text-slate-300 font-medium">Empresa:</span> {businessInfo.companyName}</p>
              <p><span className="text-slate-300 font-medium">Sector:</span> {businessInfo.industry}</p>
              <p><span className="text-slate-300 font-medium">Objetivo:</span> {getGoalDescription(businessInfo.mainGoal)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-prompt">Instrucciones para tus agentes IA</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateDefaultPrompt}
                disabled={isGenerating}
                className="h-8 text-xs"
              >
                {isGenerating ? (
                  <>Generando...</>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generar ejemplo
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="ai-prompt"
              placeholder="Describe cómo quieres que funcionen tus agentes IA, qué tareas deben realizar, cómo deben comunicarse con los clientes, etc."
              value={aiSetupPrompt}
              onChange={(e) => {
                setAiSetupPrompt(e.target.value);
                if (error) setError(null);
              }}
              rows={10}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Sé lo más específico posible. Incluye el tipo de consultas que esperas, el tono de comunicación deseado y cualquier instrucción especial para tus agentes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            Atrás
          </Button>
          <Button onClick={handleContinue}>
            Crear mi centro de IA
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepThree;
