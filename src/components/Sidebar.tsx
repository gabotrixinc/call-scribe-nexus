import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Phone,
  PhoneCall,
  Users,
  BarChart,
  Settings,
  MessageSquare
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <BarChart className="w-5 h-5" /> 
    },
    { 
      name: 'Call Management', 
      path: '/calls', 
      icon: <PhoneCall className="w-5 h-5" /> 
    },
    { 
      name: 'Agent Center', 
      path: '/agents', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      name: 'Conversations', 
      path: '/conversations', 
      icon: <MessageSquare className="w-5 h-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
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
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && <h1 className="text-xl font-bold">CallScribe</h1>}
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
          {navItems.map((item) => (
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
