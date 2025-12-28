import AppRouter from './router/AppRouter'
import { AppThemeProvider } from './theme/AppThemeProvider'

export default function App() {
  return (
    <AppThemeProvider>
      <AppRouter />
    </AppThemeProvider>
  )
}
