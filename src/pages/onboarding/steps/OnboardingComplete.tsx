
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AgentConfig } from '@/types/onboarding';

interface OnboardingCompleteProps {
  onFinish: () => void;
  generatedAgents?: AgentConfig[];
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ onFinish, generatedAgents = [] }) => {
  const navigate = useNavigate();

  const handleViewAgents = () => {
    navigate('/agents');
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
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
            ¡Configuración Completada!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Tu centro de contacto con IA está listo para usar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 py-6 space-y-6">
          <div className="rounded-lg border p-4 bg-black/30">
            <p className="text-center mb-4 text-slate-300">
              Hemos creado los siguientes agentes de IA para tu empresa:
            </p>
            
            <div className="space-y-3">
              {generatedAgents && generatedAgents.length > 0 ? (
                generatedAgents.map((agent, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-md">
                    <Bot className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-slate-400">Especialidad: {agent.specialization}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400">No se pudieron crear agentes automáticamente.</p>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold">¿Qué sigue?</h3>
            <p className="text-sm text-slate-400">
              Ahora puedes comenzar a configurar tu centro de contacto con más detalle,
              añadir más agentes, configurar integraciones y mucho más.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 pb-6">
          <Button onClick={handleViewAgents} className="w-full">
            Ver mis agentes de IA
            <Bot className="ml-2 h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={onFinish} className="w-full">
            Ir al dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OnboardingComplete;
