
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { fetchUserProfile, hasUserRole } from './authUtils';
import { AuthState } from './types';
import { User, UserRole } from '@/types/auth';

// Create a temporary mock user
const createMockUser = (): User => ({
  id: 'temp-user-id',
  email: 'temp@example.com',
  firstName: 'Temporary',
  lastName: 'User',
  role: 'admin',
  avatarUrl: null,
  createdAt: new Date().toISOString()
});

// Initial auth state with mock user
const getInitialAuthState = (): AuthState => ({
  user: createMockUser(),
  session: { user: { id: createMockUser().id } } as any,
  isLoading: false,
  error: null
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState());
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>('admin'); // Mock userRole

  // Mock login function that always succeeds
  const login = async (email: string, password: string): Promise<void> => {
    toast({
      title: "Inicio de sesión exitoso (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
    
    navigate('/', { replace: true });
  };

  // Mock register function
  const register = async (email: string, password: string, firstName?: string, lastName?: string): Promise<void> => {
    toast({
      title: "Registro exitoso (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
    
    navigate('/', { replace: true });
  };

  // Mock signUp function to match the one expected in RegisterPage
  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    toast({
      title: "Registro exitoso (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
    
    navigate('/', { replace: true });
  };

  // Mock logout function
  const logout = async (): Promise<void> => {
    toast({
      title: "Sesión cerrada (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
  };

  // Mock profile update function
  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    toast({
      title: "Perfil actualizado (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
  };

  // Alias for updateUserProfile to match the interface
  const updateProfile = updateUserProfile;

  // Mock resetPassword function
  const resetPassword = async (email: string): Promise<void> => {
    toast({
      title: "Restablecimiento de contraseña enviado (Modo Temporal)",
      description: "Autenticación deshabilitada temporalmente",
    });
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    // Always return true to bypass role checks
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        session: authState.session,
        loading: authState.isLoading,
        isLoading: authState.isLoading,
        error: authState.error,
        login,
        register,
        signUp,
        logout,
        updateUserProfile,
        updateProfile,
        resetPassword,
        hasRole,
        isAuthenticated: true, // Always authenticated
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
