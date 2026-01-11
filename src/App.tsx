import { BrowserRouter } from 'react-router-dom';
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

  const onSigninCallback = (_user: any) => {
    // Clear OIDC params from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <BrowserRouter>
      <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
        <AppThemeProvider>
          <AppRouter />
        </AppThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
