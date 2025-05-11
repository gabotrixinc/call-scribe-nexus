
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingStepOneProps {
  onNext: () => void;
}

const OnboardingStepOne: React.FC<OnboardingStepOneProps> = ({ onNext }) => {
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
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-300 text-transparent bg-clip-text">
            ¡Bienvenido a tu Centro de IA!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Vamos a configurar tu centro de contacto potenciado por IA en minutos
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center px-6 py-6">
          <p className="text-slate-300 mb-6">
            Te guiaremos a través de un proceso simple para crear:
          </p>
          
          <div className="grid gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg"
            >
              <div className="bg-primary/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              </div>
              <span>Agentes virtuales entrenados específicamente para tu negocio</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg"
            >
              <div className="bg-primary/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4 0 .7.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-.9.9-1.4Z"></path><path d="M22 12.5v6a1.2 1.2 0 0 1-2 1L10 14"></path><path d="m4.2 10.4 6.3 3.9c.5.3 1.1.3 1.7 0l10.3-6"></path><path d="M10 14v7.5"></path></svg>
              </div>
              <span>Flujos de trabajo personalizados para tu industria</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg"
            >
              <div className="bg-primary/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <span>Plantillas de respuesta y configuraciones óptimas</span>
            </motion.div>
          </div>
          
          <p className="text-slate-400 text-sm mt-6">
            Todo esto basado en la información que nos proporciones sobre tu negocio y necesidades.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button 
            onClick={onNext}
            size="lg" 
            className="w-full max-w-xs font-medium"
          >
            Comenzar configuración
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepOne;
