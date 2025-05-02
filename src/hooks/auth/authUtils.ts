
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    if (!data) {
      console.log('No user profile found for ID:', userId);
      return null;
    }

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

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const hasUserRole = (user: User | null, requiredRoles: UserRole | UserRole[]): boolean => {
  // If user is not authenticated, they have no roles
  if (!user) return false;
  
  // If requiredRoles is a single string, convert it to an array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Check if user's role is in the required roles array
  return roles.includes(user.role);
};
