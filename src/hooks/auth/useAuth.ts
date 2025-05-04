
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextType } from './types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  // This check isn't really necessary since we provide default values in AuthContext.tsx
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
