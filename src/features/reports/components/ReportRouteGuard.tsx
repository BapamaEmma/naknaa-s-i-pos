import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { REPORT_ROUTES, canAccessReportRoute } from '@/features/reports/constants'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface ReportRouteGuardProps {
  children: React.ReactNode
  path: string
}

export function ReportRouteGuard({ children, path }: ReportRouteGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner layout="inline" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!canAccessReportRoute(user.role, path)) {
    return <Navigate to={REPORT_ROUTES.ROOT} replace />
  }

  return <>{children}</>
}
