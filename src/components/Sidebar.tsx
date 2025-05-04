
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  PhoneCall, 
  Users, 
  MessageSquare, 
  Settings as SettingsIcon,
  Bot, 
  BarChart,
  ThumbsUp,
  CloudCog
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Llamadas', href: '/calls', icon: PhoneCall },
    { name: 'Contactos', href: '/contacts', icon: Users },
    { name: 'Mensajería', href: '/messaging', icon: MessageSquare },
    { name: 'Agentes IA', href: '/agents', icon: Bot },
    { name: 'Reportes', href: '/reports', icon: BarChart },
    { name: 'Feedback', href: '/feedback', icon: ThumbsUp },
    { name: 'Integraciones', href: '/integrations', icon: CloudCog },
    { name: 'Configuración', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r dark:border-gray-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary p-2 rounded-md">
              <PhoneCall className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">Gabotrix CX</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Version Info */}
        <div className="p-4 text-xs text-muted-foreground border-t dark:border-gray-800">
          <p>Versión 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
