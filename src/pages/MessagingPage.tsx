
import React from 'react';
import Layout from '@/components/Layout';

const MessagingPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mensajería</h1>
            <p className="text-muted-foreground">Gestiona tus conversaciones de mensajería.</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-2xl font-semibold mb-2">Centro de mensajería</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            El módulo de mensajería estará disponible en la próxima actualización.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MessagingPage;
