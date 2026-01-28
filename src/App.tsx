import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { useAuthStore } from './stores/authStore';
import { useIdleTimer } from './hooks/useIdleTimer';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig, userManager } from './auth/oidcConfig';

export default function App() {
  // Auto-logout after 30 minutes of inactivity
  useIdleTimer(30);

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
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
      <AuthSync />
      {children}
    </AuthProvider>
  );
}

function AuthSync() {
  const auth = useAuth();

  const { refreshUser } = useAuthStore();

  useEffect(() => {
    // [Phase 25] Resilient Session Check
    // If OIDC is still loading, wait.
    if (auth.isLoading) return;

    // 1. If OIDC identified a session, use it to refresh user details
    if (auth.isAuthenticated && auth.user?.access_token) {
      refreshUser(auth.user.access_token);
    } else {
      // 2. Fallback: If OIDC found no session, check for legacy/social API cookie
      // refreshUser() will check /users/me using the browser's cookies.
      // If no cookie exists, it will correctly set user to null and stop the loading spinner.
      refreshUser().catch(() => {
        useAuthStore.setState({ isLoading: false });
      });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.access_token, refreshUser]);

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
