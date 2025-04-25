
import React from 'react';
import Layout from '@/components/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import ActiveCallsChart from '@/components/dashboard/ActiveCallsChart';
import CallQualityChart from '@/components/dashboard/CallQualityChart';
import ActiveCallsList from '@/components/calls/ActiveCallsList';
import CallSimulator from '@/components/dashboard/CallSimulator';
import { 
  PhoneCall,
  Users,
  MessageSquare,
  User
} from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your contact center performance.</p>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Active Calls" 
            value="26"
            description="Current active calls"
            icon={<PhoneCall className="h-4 w-4" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard 
            title="Active Agents" 
            value="14"
            description="4 human, 10 AI agents"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 5, positive: true }}
          />
          <StatsCard 
            title="Avg. Response Time" 
            value="1.2s"
            description="From last 100 calls"
            icon={<MessageSquare className="h-4 w-4" />}
            trend={{ value: 15, positive: true }}
          />
          <StatsCard 
            title="Handled Today" 
            value="187"
            description="Calls processed today"
            icon={<User className="h-4 w-4" />}
            trend={{ value: 8, positive: true }}
          />
        </div>
        
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-12">
          <ActiveCallsChart />
          <CallQualityChart />
        </div>
        
        <div className="grid gap-4 grid-cols-1">
          <CallSimulator />
          <ActiveCallsList />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
