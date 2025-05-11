
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingCompleteProps {
  onFinish: () => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ onFinish }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="border-0 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0">
          <div className="animate-pulse absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br from-primary to-violet-600"></div>
        </div>
        
        <CardHeader className="text-center pb-2 relative">
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
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 text-transparent bg-clip-text">
            ¡Configuración completada!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Tu centro de contacto con IA está listo para usar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center px-6 py-6 relative">
          <p className="text-slate-300 mb-8">
            Hemos configurado todo tu entorno basado en la información proporcionada:
          </p>
          
          <div className="grid gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg"
            >
              <div className="bg-green-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <span>Agentes de IA personalizados creados</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg"
            >
              <div className="bg-green-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <span>Plantillas de mensajes configuradas</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg"
            >
              <div className="bg-green-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <span>Flujos de trabajo optimizados creados</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg"
            >
              <div className="bg-green-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
              </div>
              <span>Panel de control personalizado</span>
            </motion.div>
          </div>
          
          <p className="text-slate-400 text-sm">
            Puedes comenzar a usar tu centro de contacto inmediatamente o realizar ajustes adicionales en la sección de configuración.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6 relative">
          <Button 
            onClick={onFinish}
            size="lg" 
            className="w-full max-w-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
          >
            Ir al Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OnboardingComplete;
