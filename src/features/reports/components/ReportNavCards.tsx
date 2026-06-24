import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { REPORT_NAV_ITEMS } from '@/features/reports/constants'
import { canAccessReportRoute } from '@/features/reports/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function ReportNavCards() {
  const { user } = useAuth()

  if (!user) return null

  const items = REPORT_NAV_ITEMS.filter((item) => canAccessReportRoute(user.role, item.href))

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.href} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={item.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open report
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
