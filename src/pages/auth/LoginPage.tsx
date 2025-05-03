
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  // Bypass login - automatic redirect
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Auto-redirect to main page
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  // Show quick message and redirect
  return (
    <Navigate to="/" replace />
  );
};

export default LoginPage;
