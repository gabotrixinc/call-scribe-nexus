
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingFlow from './OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';

const OnboardingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Si no hay usuario autenticado y terminó de cargar, redirigir al login
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-slate-800">
      <OnboardingFlow />
    </div>
  );
};

export default OnboardingPage;
