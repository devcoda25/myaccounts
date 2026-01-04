import { useEffect } from 'react';
import AppRouter from './router/AppRouter'
import { AppThemeProvider } from './theme/AppThemeProvider'

import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const { refreshUser } = useAuthStore();

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
