
import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState } from './types';
import { getInitialAuthState, useMockAuth } from './mockAuthUtils';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState());
  const [userRole, setUserRole] = useState<string | null>('admin'); // Mock userRole
  
  const {
    login,
    register,
    signUp,
    logout,
    updateUserProfile,
    updateProfile,
    resetPassword,
    hasRole
  } = useMockAuth();

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
        isAuthenticated: Boolean(authState.user), // Derive from user state
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
