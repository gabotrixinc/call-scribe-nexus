
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { user, isLoading, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      console.log("AuthGuard check - isAuthenticated:", isAuthenticated, "user:", user);
      
      // If user is not logged in, redirect to login
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to", redirectTo);
        navigate(redirectTo, { 
          replace: true, 
          state: { from: location.pathname } 
        });
        return;
      }

      // If allowedRoles is provided and user doesn't have any of the required roles, redirect
      if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        console.log("User doesn't have required roles, redirecting to unauthorized");
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [user, isLoading, navigate, redirectTo, allowedRoles, hasRole, isAuthenticated, location]);

  // Show loading state while checking auth status
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
  return isAuthenticated && (allowedRoles.length === 0 || hasRole(allowedRoles)) ? <>{children}</> : null;
};

export default AuthGuard;
