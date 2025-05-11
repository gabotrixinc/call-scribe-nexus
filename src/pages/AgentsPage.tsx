
import React from 'react';
import Layout from '@/components/Layout';
import AgentsList from '@/components/agents/AgentsList';

const AgentsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
          <p className="text-muted-foreground">Gestiona tus agentes humanos y de IA para llamadas y mensajería.</p>
        </div>
        
        <AgentsList />
      </div>
    </Layout>
  );
};

export default AgentsPage;
