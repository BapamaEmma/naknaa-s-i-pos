import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  DEFAULT_UNAUTHENTICATED_ROUTE,
  getDefaultAuthenticatedRoute,
  ROUTES,
} from '@/constants/routes'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/features/auth/hooks/use-auth'

function AuthLoadingScreen() {
  return <LoadingSpinner size="lg" layout="page" className="min-h-[100dvh]" />
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedRoute(user?.role)} replace />
  }

  return <Outlet />
}

export function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  return (
    <Navigate
      to={
        isAuthenticated
          ? getDefaultAuthenticatedRoute(user?.role)
          : DEFAULT_UNAUTHENTICATED_ROUTE
      }
      replace
    />
  )
}
