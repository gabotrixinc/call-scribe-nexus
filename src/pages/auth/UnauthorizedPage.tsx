
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="text-center max-w-md">
        <div className="w-full flex justify-center mb-6">
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-4 rounded-full">
            <AlertTriangle size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Acceso no autorizado</h1>
        <p className="text-muted-foreground mb-8">
          No tienes permiso para acceder a esta página. Si crees que esto es un error,
          por favor contacta al administrador del sistema.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
