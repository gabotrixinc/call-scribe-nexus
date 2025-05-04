
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="text-center max-w-md">
        <div className="w-full flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-4 rounded-full">
            <Search size={48} />
          </div>
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
