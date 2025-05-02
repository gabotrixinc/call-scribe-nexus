
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="glass-card p-8 rounded-xl max-w-lg w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-secondary/50 rounded-full">
            <Shield className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 neo-gradient glow-text">Acceso denegado</h1>
        
        <p className="text-muted-foreground mb-6">
          No tienes los permisos necesarios para acceder a esta sección. Si crees que esto es un error, contacta al administrador del sistema.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Ir a inicio
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/login">
              Iniciar con otra cuenta
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
