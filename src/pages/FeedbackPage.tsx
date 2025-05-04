
import React from 'react';
import Layout from '@/components/Layout';

const FeedbackPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
            <p className="text-muted-foreground">Gestiona el feedback de tus clientes y mejora la calidad del servicio.</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-2xl font-semibold mb-2">Sistema de Feedback</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Esta funcionalidad estará disponible próximamente. Podrás recopilar y analizar el feedback de tus clientes.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
