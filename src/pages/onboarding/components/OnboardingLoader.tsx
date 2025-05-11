
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressState {
  agentsCreated: number;
  promptsConfigured: number;
  workflowsSetup: number;
  templatesCreated: number;
}

interface OnboardingLoaderProps {
  progress: ProgressState;
}

const LoadingMessage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center gap-3 text-slate-300"
  >
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    <span>{children}</span>
  </motion.div>
);

const CompleteMessage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center gap-3 text-green-400"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>{children}</span>
  </motion.div>
);

const OnboardingLoader: React.FC<OnboardingLoaderProps> = ({ progress }) => {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseComplete, setPhaseComplete] = useState<boolean[]>([false, false, false, false]);
  
  // Animation phrases
  const loadingPhrases = [
    "Analizando información del negocio...",
    "Generando modelos de agentes IA...",
    "Optimizando flujos de conversación...",
    "Creando plantillas personalizadas...",
    "Configurando panel de control...",
    "Finalizando configuración..."
  ];
  
  const [currentPhrase, setCurrentPhrase] = useState(0);
  
  useEffect(() => {
    // Update progress percentage based on completed phases
    const totalScore = progress.agentsCreated + progress.promptsConfigured + 
                      progress.workflowsSetup + progress.templatesCreated;
    const maxPossibleScore = 11; // 2 agents + 4 prompts + 2 workflows + 3 templates
    const calculatedProgress = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);
    
    // Gradually increase the progress bar
    const targetProgress = calculatedProgress;
    const step = Math.max(1, Math.floor((targetProgress - progressPercentage) / 10));
    
    const timer = setTimeout(() => {
      if (progressPercentage < targetProgress) {
        setProgressPercentage(prev => Math.min(prev + step, targetProgress));
      }
    }, 100);
    
    // Cycle through phrases
    const phraseTimer = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
    }, 3000);
    
    // Update current phase based on progress
    if (progress.agentsCreated > 0 && !phaseComplete[0]) {
      setCurrentPhase(1);
      setPhaseComplete([true, false, false, false]);
    }
    if (progress.promptsConfigured > 0 && !phaseComplete[1]) {
      setCurrentPhase(2);
      setPhaseComplete([true, true, false, false]);
    }
    if (progress.workflowsSetup > 0 && !phaseComplete[2]) {
      setCurrentPhase(3);
      setPhaseComplete([true, true, true, false]);
    }
    if (progress.templatesCreated > 0 && !phaseComplete[3]) {
      setCurrentPhase(4);
      setPhaseComplete([true, true, true, true]);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(phraseTimer);
    };
  }, [progress, progressPercentage, phaseComplete]);

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
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-full flex justify-center mb-5"
          >
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-r-primary border-l-transparent border-t-transparent border-b-transparent animate-spin-slow"></div>
              <Loader2 className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-300 text-transparent bg-clip-text">
            Configurando tu centro de IA
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Estamos creando tu configuración personalizada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Progreso</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-1">
              {loadingPhrases[currentPhrase]}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border/30 bg-card/20">
              <h3 className="text-sm font-medium mb-3">Estado de la configuración:</h3>
              <div className="space-y-3">
                {currentPhase >= 0 ? (
                  phaseComplete[0] ? (
                    <CompleteMessage>
                      {progress.agentsCreated} agentes IA creados y configurados
                    </CompleteMessage>
                  ) : (
                    <LoadingMessage>Creando agentes IA personalizados...</LoadingMessage>
                  )
                ) : null}
                
                {currentPhase >= 1 ? (
                  phaseComplete[1] ? (
                    <CompleteMessage>
                      {progress.promptsConfigured} instrucciones y prompts configurados
                    </CompleteMessage>
                  ) : (
                    <LoadingMessage>Configurando instrucciones y prompts...</LoadingMessage>
                  )
                ) : null}
                
                {currentPhase >= 2 ? (
                  phaseComplete[2] ? (
                    <CompleteMessage>
                      {progress.workflowsSetup} flujos de trabajo configurados
                    </CompleteMessage>
                  ) : (
                    <LoadingMessage>Configurando flujos de trabajo...</LoadingMessage>
                  )
                ) : null}
                
                {currentPhase >= 3 ? (
                  phaseComplete[3] ? (
                    <CompleteMessage>
                      {progress.templatesCreated} plantillas de mensajes creadas
                    </CompleteMessage>
                  ) : (
                    <LoadingMessage>Creando plantillas de mensajes...</LoadingMessage>
                  )
                ) : null}
                
                {currentPhase >= 4 && (
                  <LoadingMessage>Finalizando configuración del dashboard...</LoadingMessage>
                )}
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Este proceso puede tardar unos minutos mientras configuramos todo según tus necesidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingLoader;
