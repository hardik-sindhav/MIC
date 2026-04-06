import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useTheme } from './hooks/useTheme.js'
import { AuthLayout } from './layouts/AuthLayout.jsx'
import { DashboardLayout } from './layouts/DashboardLayout.jsx'
import { AdManagerPage } from './pages/AdManagerPage.jsx'
import { CardsPage } from './pages/CardsPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { Login } from './pages/Login.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { ShopPage } from './pages/ShopPage.jsx'
import { SupportPage } from './pages/SupportPage.jsx'
import { UsersPage } from './pages/UsersPage.jsx'

function LoginRoute({ theme, onToggleTheme }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <AuthLayout theme={theme} onToggleTheme={onToggleTheme}>
      <Login />
    </AuthLayout>
  )
}

function AppRoutes() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={<LoginRoute theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<DashboardLayout theme={theme} onToggleTheme={toggleTheme} />}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="ad-manager" element={<AdManagerPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster
        theme={theme === 'dark' ? 'dark' : 'light'}
        richColors
        closeButton
        position="top-right"
        expand
        duration={5000} /* keep in sync with --mic-toast-duration-ms in index.css */
        visibleToasts={4}
        gap={12}
        offset={{ top: '1rem', right: '1rem' }}
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'font-sans mic-toast',
          },
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
