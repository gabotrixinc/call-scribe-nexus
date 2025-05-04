
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { fetchUserProfile, hasUserRole } from './authUtils';
import { AuthState } from './types';
import { User, UserRole } from '@/types/auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a temporary mock user for bypass
  const mockUser: User = {
    id: 'temp-user-id',
    email: 'temp@example.com',
    firstName: 'Temporary',
    lastName: 'User',
    role: 'admin',
    avatarUrl: null,
    createdAt: new Date().toISOString()
  };

  const [authState, setAuthState] = useState<AuthState>({
    user: mockUser,
    session: { user: { id: mockUser.id } } as any,
    isLoading: false,
    error: null
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Keep the original auth code commented out for future use
  /*
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        // Update session immediately
        setAuthState(state => ({
          ...state,
          session,
        }));
        
        // Avoid supabase deadlock by using setTimeout
        if (session?.user) {
          setTimeout(async () => {
            try {
              const user = await fetchUserProfile(session.user.id);
              console.log("Fetched user profile:", user);
              setAuthState(state => ({
                ...state,
                user,
                isLoading: false,
              }));
              
              // Redirect to dashboard on successful login
              if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
                navigate('/');
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
              setAuthState(state => ({
                ...state,
                isLoading: false,
              }));
            }
          }, 0);
        } else {
          setAuthState(state => ({
            ...state,
            user: null,
            isLoading: false,
          }));
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setAuthState(state => ({
        ...state,
        session,
      }));
      
      if (session?.user) {
        try {
          const user = await fetchUserProfile(session.user.id);
          console.log("Initial user profile:", user);
          setAuthState(state => ({
            ...state,
            user,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error fetching initial user profile:", error);
          setAuthState(state => ({
            ...state,
            isLoading: false,
          }));
        }
      } else {
        setAuthState(state => ({
          ...state,
          isLoading: false,
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);
  */

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
        logout,
        updateUserProfile,
        updateProfile,
        resetPassword,
        hasRole,
        isAuthenticated: true, // Always authenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
