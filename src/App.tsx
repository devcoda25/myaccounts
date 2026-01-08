import { useEffect } from 'react';
import AppRouter from './router/AppRouter'
import { AppThemeProvider } from './theme/AppThemeProvider'

import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import { useIdleTimer } from './hooks/useIdleTimer';

export default function App() {
  const { refreshUser } = useAuthStore();

  // Auto-logout after 30 minutes of inactivity
  useIdleTimer(30);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <AppThemeProvider>
        <AppRouter />
      </AppThemeProvider>
    </BrowserRouter>
  )
}
