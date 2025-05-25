
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

  // Create floating particles effect
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
      
      const particles = document.querySelector('.particles');
      if (particles) {
        particles.appendChild(particle);
        
        setTimeout(() => {
          particle.remove();
        }, 8000);
      }
    };

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    const interval = setInterval(createParticle, 2000);

    return () => {
      clearInterval(interval);
      particlesContainer.remove();
    };
  }, []);

  return (
    <AuthGuard allowedRoles={requiredRoles}>
      <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float floating-delayed"></div>
          <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col relative">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in relative">
            <div className="relative z-10">
              {children}
            </div>
          </main>
          <footer className="p-4 glass-panel text-xs text-muted-foreground text-center backdrop-blur-sm relative z-10">
            <div className="neo-gradient glow-text font-medium">
              Gabotrix CX © {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Layout;
