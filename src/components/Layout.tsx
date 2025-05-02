
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
        <footer className="p-4 border-t border-white/5 text-xs text-muted-foreground text-center backdrop-blur-sm">
          CallScribe Nexus © {new Date().getFullYear()} | <span className="glow-text">Powered by Google AI</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
