
import React from 'react';
import Layout from '@/components/Layout';

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">Administra la configuración de tu plataforma.</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-2xl font-semibold mb-2">Página en Desarrollo</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Esta página está actualmente en desarrollo. Próximamente podrás configurar todos los aspectos de tu centro de contacto.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
