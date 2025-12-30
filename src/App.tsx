import AppRouter from './router/AppRouter'
import { AppThemeProvider } from './theme/AppThemeProvider'

import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <AppThemeProvider>
        <AdminAuthProvider>
          <AppRouter />
        </AdminAuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  )
}
