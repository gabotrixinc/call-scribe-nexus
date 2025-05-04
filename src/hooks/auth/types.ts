
import { User } from '@/types/auth';

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  isAuthenticated: boolean;
  // Add missing properties needed by other components
  userRole: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}
