
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, AuthState, UserRole } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<{ error: any }>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        setAuthState(state => ({
          ...state,
          session,
        }));
        
        // Avoid supabase deadlock by using setTimeout
        if (session?.user) {
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
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
      setAuthState(state => ({
        ...state,
        session,
      }));
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Transform the database profile to match our User type
      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role as UserRole,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at
      };

      setAuthState(state => ({
        ...state,
        user,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState(state => ({
        ...state,
        isLoading: false,
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate('/');
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
        await fetchUserProfile(authState.user.id);
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
    // If user is not authenticated, they have no roles
    if (!authState.user) return false;
    
    // If requiredRoles is a single string, convert it to an array
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user's role is in the required roles array
    return roles.includes(authState.user.role);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
