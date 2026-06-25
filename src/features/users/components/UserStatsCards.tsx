import { Activity, ShieldAlert, ShieldCheck, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UserStatistics } from '@/features/users/types'

interface UserStatsCardsProps {
  statistics?: UserStatistics
  isLoading?: boolean
}

export function UserStatsCards({ statistics, isLoading }: UserStatsCardsProps) {
  if (isLoading) {
    return (
      <LoadingSpinner layout="cards" />
    )
  }

  const cards = [
    {
      title: 'Total Users',
      value: statistics?.totalUsers ?? 0,
      icon: Users,
    },
    {
      title: 'Active Users',
      value: statistics?.activeUsers ?? 0,
      icon: ShieldCheck,
    },
    {
      title: 'Suspended Users',
      value: statistics?.suspendedUsers ?? 0,
      icon: ShieldAlert,
    },
    {
      title: 'Online Users',
      value: statistics?.onlineUsers ?? 0,
      icon: Activity,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
