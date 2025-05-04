
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create a default context value to prevent "undefined context" errors
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  signUp: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  updateUserProfile: async () => {},
  hasRole: () => false,
  isAuthenticated: false,
  userRole: null,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);
