
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) => {
  const { user, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login
      if (!user) {
        navigate(redirectTo);
        return;
      }

      // If allowedRoles is provided and user doesn't have any of the required roles, redirect
      if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        navigate('/unauthorized');
      }
    }
  }, [user, isLoading, navigate, redirectTo, allowedRoles, hasRole]);

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  // If not loading and user is authenticated with correct role, render children
  return user && (allowedRoles.length === 0 || hasRole(allowedRoles)) ? <>{children}</> : null;
};

export default AuthGuard;
