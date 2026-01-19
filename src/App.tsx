import { BrowserRouter, useNavigate } from 'react-router-dom';
import React from 'react';
import AppRouter from './router/AppRouter';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { useAuthStore } from './stores/authStore';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig } from './auth/oidcConfig';

export default function App() {
  const { refreshUser } = useAuthStore();

  // Auto-logout after 30 minutes of inactivity
  useIdleTimer(30);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <AuthProviderWrapper>
        <AppThemeProvider>
          <AppRouter />
        </AppThemeProvider>
      </AuthProviderWrapper>
    </BrowserRouter>
  );
}

function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const onSigninCallback = (_user: any) => {
    // Clear OIDC params from URL and navigate to app
    window.history.replaceState({}, document.title, window.location.pathname);
    navigate('/app', { replace: true });
  };

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <AuthSync />
      {children}
    </AuthProvider>
  );
}

function AuthSync() {
  const auth = useAuth();

  const { refreshUser } = useAuthStore();

  useEffect(() => {
    if (auth.isAuthenticated) {
      // [Fix] Race Condition: Allow oidc-client-ts to flush to sessionStorage
      const timer = setTimeout(() => {
        refreshUser();
      }, 1000); // 1s delay to guarantee persistence
      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, refreshUser]);

  useEffect(() => {
    const handleLogout = () => {
      console.warn("[App] Received auth:logout event. Removing user from OIDC context.");
      // void auth.removeUser(); // Use void to ignore promise, or await inside async func
      auth.removeUser().catch(console.error);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [auth]);

  return null;
}
