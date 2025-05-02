
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Phone,
  PhoneCall,
  Users,
  BarChart,
  Settings,
  MessageSquare,
  MessageCircle,
  UserCog
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasRole } = useAuth();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <BarChart className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'agent', 'viewer']
    },
    { 
      name: 'Call Management', 
      path: '/calls', 
      icon: <PhoneCall className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'agent']
    },
    { 
      name: 'Agent Center', 
      path: '/agents', 
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager']
    },
    { 
      name: 'Conversations', 
      path: '/conversations', 
      icon: <MessageSquare className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'agent']
    },
    { 
      name: 'WhatsApp Messaging', 
      path: '/messaging', 
      icon: <MessageCircle className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager', 'agent']
    },
    { 
      name: 'User Management', 
      path: '/users', 
      icon: <UserCog className="w-5 h-5" />,
      allowedRoles: ['admin']
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['admin', 'manager']
    },
  ];
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  const filteredNavItems = navItems.filter(item => {
    return item.allowedRoles?.some(role => hasRole(role as UserRole));
  });
  
  return (
    <div 
      className={cn(
        "bg-background border-r flex flex-col transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b flex items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-primary rounded-md p-1">
            <img 
              src="/lovable-uploads/786b72bc-7591-4068-bde8-62021e00bc80.png" 
              alt="Gabotrix CX" 
              className="h-6 w-6" 
            />
          </div>
          {!collapsed && <h1 className="text-xl font-bold">Gabotrix CX</h1>}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleCollapsed}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button 
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start", 
                    collapsed ? "justify-center px-2" : "px-3"
                  )}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="ml-2">{item.name}</span>
                  )}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <div className={cn(
          "bg-accent p-3 rounded-md flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
          {!collapsed && <span className="ml-2 text-sm font-medium">System Online</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
