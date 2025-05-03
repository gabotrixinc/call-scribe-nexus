
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

// Pages
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFound from './pages/NotFound';
import CallsPage from './pages/CallsPage';
import MessagingPage from './pages/MessagingPage';
import ConversationsPage from './pages/ConversationsPage';
import AgentsPage from './pages/AgentsPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/users/UserManagementPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import AutomationPage from './pages/AutomationPage';
import Index from './pages/Index';
import { UserRole } from './types/auth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Index />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/calls"
            element={
              <AuthGuard>
                <CallsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/messaging"
            element={
              <AuthGuard>
                <MessagingPage />
              </AuthGuard>
            }
          />
          <Route
            path="/conversations"
            element={
              <AuthGuard>
                <ConversationsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/agents"
            element={
              <AuthGuard>
                <AgentsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/users"
            element={
              <AuthGuard allowedRoles={['admin' as UserRole]}>
                <UserManagementPage />
              </AuthGuard>
            }
          />
          <Route
            path="/automations"
            element={
              <AuthGuard>
                <AutomationPage />
              </AuthGuard>
            }
          />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
