
import { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Create a temporary mock user
export const createMockUser = (): User => ({
  id: 'temp-user-id',
  email: 'temp@example.com',
  firstName: 'Temporary',
  lastName: 'User',
  role: 'admin',
  avatarUrl: null,
  createdAt: new Date().toISOString()
});

// Initial auth state with mock user
export const getInitialAuthState = () => ({
  user: createMockUser(),
  session: { user: { id: createMockUser().id } } as any,
  isLoading: false,
  error: null
});

// Hook to use mock auth functionality
export const useMockAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Mock hasRole function
  const hasRole = (roles: string | string[]): boolean => {
    // Always return true in mock mode
    return true;
  };

  return {
    login,
    register,
    signUp,
    logout,
    updateUserProfile,
    updateProfile,
    resetPassword,
    hasRole
  };
};
