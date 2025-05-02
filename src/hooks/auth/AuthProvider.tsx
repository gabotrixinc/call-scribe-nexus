
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { fetchUserProfile, hasUserRole } from './authUtils';
import { AuthState } from './types';
import { User, UserRole } from '@/types/auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // No need to navigate here as onAuthStateChange will handle redirects
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a Gabotrix CX",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales e intenta nuevamente",
        variant: "destructive",
      });
      return { error };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Verifica tu correo electrónico para confirmar tu cuenta.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Inténtalo nuevamente",
        variant: "destructive",
      });
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      // Convert from camelCase to snake_case for database
      const dbData = {
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl,
        role: data.role,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', authState.user?.id);
      
      if (error) throw error;
      
      // Re-fetch user profile to update state
      if (authState.user?.id) {
        const user = await fetchUserProfile(authState.user.id);
        if (user) {
          setAuthState(state => ({
            ...state,
            user,
          }));
        }
      }
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message || "Inténtalo nuevamente",
        variant: "destructive",
      });
      return { error };
    }
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    return hasUserRole(authState.user, requiredRoles);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUserProfile,
        hasRole,
        isAuthenticated: !!authState.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
