
import React, { useState, useEffect } from 'react';
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

  // Create floating orbs effect
  useEffect(() => {
    const createFloatingOrb = () => {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.animationDelay = Math.random() * 8 + 's';
      orb.style.animationDuration = (Math.random() * 10 + 15) + 's';
      
      const container = document.querySelector('.floating-orbs-container');
      if (container) {
        container.appendChild(orb);
        
        setTimeout(() => {
          orb.remove();
        }, 25000);
      }
    };

    const orbsContainer = document.createElement('div');
    orbsContainer.className = 'floating-orbs-container';
    document.body.appendChild(orbsContainer);

    const interval = setInterval(createFloatingOrb, 3000);

    return () => {
      clearInterval(interval);
      orbsContainer.remove();
    };
  }, []);

  return (
    <AuthGuard allowedRoles={requiredRoles}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0">
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
          <Sidebar isOpen={sidebarOpen} />
          
          <div className="flex-1 flex flex-col">
            <Header toggleSidebar={toggleSidebar} />
            
            <main className="flex-1 pt-20 p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            
            <footer className="relative z-10 p-6 text-center">
              <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl">
                <span className="text-sm text-gray-400">
                  © {new Date().getFullYear()} Gabotrix CX - Powered by AI
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Layout;
