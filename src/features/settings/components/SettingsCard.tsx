import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SETTINGS_CARD_ICONS } from '@/features/settings/constants'
import type { SettingsDashboardCard } from '@/features/settings/types'

interface SettingsCardProps {
  card: SettingsDashboardCard
}

export function SettingsCard({ card }: SettingsCardProps) {
  const Icon = SETTINGS_CARD_ICONS[card.id as keyof typeof SETTINGS_CARD_ICONS]

  return (
    <Link to={card.href} className="group block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <CardTitle className="text-base">{card.title}</CardTitle>
          <CardDescription>{card.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-sm font-medium text-primary">Configure</span>
        </CardContent>
      </Card>
    </Link>
  )
}
