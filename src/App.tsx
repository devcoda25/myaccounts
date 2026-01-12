import { BrowserRouter, useNavigate } from 'react-router-dom';
import React from 'react';
import AppRouter from './router/AppRouter';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { useAuthStore } from './stores/authStore';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useEffect } from 'react';
import { AuthProvider } from 'react-oidc-context';
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
      {children}
    </AuthProvider>
  );
}
