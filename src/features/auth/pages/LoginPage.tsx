import { Navigate, useLocation } from 'react-router-dom'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/constants/routes'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    DEFAULT_AUTHENTICATED_ROUTE

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 space-y-1 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Sign in to your NakNaa POS account</p>
      </div>
      <LoginForm />
    </div>
  )
}
