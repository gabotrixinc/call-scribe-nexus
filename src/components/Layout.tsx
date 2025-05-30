
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from './auth/AuthGuard';
import { UserRole } from '@/types/auth';

interface LayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const Layout: React.FC<LayoutProps> = ({ children, requiredRoles = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthGuard allowedRoles={requiredRoles}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
            {children}
          </main>
          <footer className="p-4 border-t border-white/5 text-xs text-muted-foreground text-center backdrop-blur-sm">
            Gabotrix CX © {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Layout;
