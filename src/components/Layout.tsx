
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
        <footer className="p-4 border-t text-xs text-muted-foreground text-center">
          CallScribe Nexus © {new Date().getFullYear()} | Powered by Google AI
        </footer>
      </div>
    </div>
  );
};

export default Layout;
