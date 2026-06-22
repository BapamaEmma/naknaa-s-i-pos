import { Navigate } from 'react-router-dom'
import { canAccessRoute } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface RoleGuardProps {
  children: React.ReactNode
  path: string
}

export function RoleGuard({ children, path }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (!canAccessRoute(user.role, path)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}
