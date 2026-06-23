import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditSettingsTable } from '@/features/settings/components/AuditSettingsTable'
import { SettingsCard } from '@/features/settings/components/SettingsCard'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_DASHBOARD_CARDS } from '@/features/settings/constants'
import { useSettingsAuditLog } from '@/features/settings/hooks/use-settings'

export function SettingsPage() {
  const { data: auditLog = [], isLoading: auditLoading } = useSettingsAuditLog()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Settings"
        description="Central configuration hub for NakNaa Electronics POS & Inventory Management."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_DASHBOARD_CARDS.map((card) => (
          <SettingsCard key={card.id} card={card} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent settings changes, user changes, and security events.
          </p>
        </CardHeader>
        <CardContent>
          <AuditSettingsTable entries={auditLog} isLoading={auditLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
