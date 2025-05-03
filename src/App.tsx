
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import CallsPage from '@/pages/CallsPage';
import ConversationsPage from '@/pages/ConversationsPage';
import AgentsPage from '@/pages/AgentsPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage';
import SettingsPage from '@/pages/SettingsPage';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import AuthGuard from '@/components/auth/AuthGuard';
import './App.css';
import Index from '@/pages/Index';
import MessagingPage from '@/pages/MessagingPage';
import AutomationPage from '@/pages/AutomationPage';
import UserManagementPage from '@/pages/users/UserManagementPage';
import ContactsPage from '@/pages/ContactsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/calls" element={<AuthGuard><CallsPage /></AuthGuard>} />
          <Route path="/conversations" element={<AuthGuard><ConversationsPage /></AuthGuard>} />
          <Route path="/contacts" element={<AuthGuard><ContactsPage /></AuthGuard>} />
          <Route path="/messaging" element={<AuthGuard><MessagingPage /></AuthGuard>} />
          <Route path="/agents" element={<AuthGuard><AgentsPage /></AuthGuard>} />
          <Route path="/automation" element={<AuthGuard><AutomationPage /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path="/users" element={<AuthGuard requiredRole="admin"><UserManagementPage /></AuthGuard>} />
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
