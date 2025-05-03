
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  PhoneCall,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  MessagesSquare,
  UserCog,
  Import,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  active,
  onClick,
  disabled = false,
}) => {
  if (disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3 rounded-lg text-muted-foreground',
          'opacity-50 cursor-not-allowed'
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-secondary transition-colors',
        active && 'bg-secondary'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { logout, hasRole, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const { isMobile, isCollapsed, setIsCollapsed } = useIsMobile();
  
  const handleLogout = async () => {
    await logout();
  };
  
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-screen flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        {
          'w-[280px]': !isCollapsed,
          'w-[72px]': isCollapsed,
        }
      )}
    >
      <div className="flex justify-between items-center h-16 px-4 border-b border-border">
        <div className={cn('flex items-center', isCollapsed && 'justify-center w-full')}>
          {!isCollapsed && <span className="text-xl font-bold">MiContactCenter</span>}
          {isCollapsed && <span className="text-xl font-bold">MCC</span>}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')}
            />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </div>

      <nav className="flex-grow pt-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          <NavLink
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label={isCollapsed ? '' : 'Dashboard'}
            active={pathname === '/dashboard'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          <NavLink
            to="/calls"
            icon={<PhoneCall className="h-5 w-5" />}
            label={isCollapsed ? '' : 'Llamadas'}
            active={pathname === '/calls'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          <NavLink
            to="/messaging"
            icon={<MessageSquare className="h-5 w-5" />}
            label={isCollapsed ? '' : 'WhatsApp'}
            active={pathname === '/messaging'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          <NavLink
            to="/conversations"
            icon={<MessagesSquare className="h-5 w-5" />}
            label={isCollapsed ? '' : 'Conversaciones'}
            active={pathname === '/conversations'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          <NavLink
            to="/agents"
            icon={<Users className="h-5 w-5" />}
            label={isCollapsed ? '' : 'Agentes'}
            active={pathname === '/agents'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          <NavLink
            to="/automations"
            icon={<Import className="h-5 w-5" />}
            label={isCollapsed ? '' : 'Automatizaciones'}
            active={pathname === '/automations'}
            onClick={() => isMobile && setIsCollapsed(true)}
          />
          {hasRole('admin') && (
            <NavLink
              to="/users"
              icon={<UserCog className="h-5 w-5" />}
              label={isCollapsed ? '' : 'Usuarios'}
              active={pathname === '/users'}
              onClick={() => isMobile && setIsCollapsed(true)}
            />
          )}
        </div>
      </nav>

      <div className="p-2 border-t border-border">
        <NavLink
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label={isCollapsed ? '' : 'Configuración'}
          active={pathname === '/settings'}
          onClick={() => isMobile && setIsCollapsed(true)}
        />
        <div
          className={cn(
            'flex items-center gap-4 px-4 py-3 rounded-lg text-red-500 hover:bg-secondary transition-colors cursor-pointer',
            'mt-1'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
