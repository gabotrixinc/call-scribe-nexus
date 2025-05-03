
import { useAuth } from '@/hooks/useAuth';
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
  // Authentication is temporarily bypassed - just render children
  return <>{children}</>;
};

export default AuthGuard;
