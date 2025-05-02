
import { UserRole, User } from '@/types/auth';

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<{ error: any }>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}
