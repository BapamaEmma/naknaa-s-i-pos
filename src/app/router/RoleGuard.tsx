import { Navigate } from 'react-router-dom'
import type { UserRole } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { hasRole } = useAuth()

  if (!hasRole(roles)) {
    return fallback ?? <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}
