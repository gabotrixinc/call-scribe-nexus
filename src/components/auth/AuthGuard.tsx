
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles = [] }) => {
  const { user, loading, userRole, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If there are allowed roles specified and the user doesn't have one of them
  if (
    allowedRoles.length > 0 && 
    !hasRole(allowedRoles)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // For public routes, allow access even if not logged in
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // For protected routes, redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in and has required role (or no specific role required)
  return <>{children}</>;
};

export default AuthGuard;
