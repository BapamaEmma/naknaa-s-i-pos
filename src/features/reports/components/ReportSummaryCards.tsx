import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/format'

interface SummaryCardItem {
  label: string
  value: number | string
  format?: 'currency' | 'number' | 'text'
}

interface ReportSummaryCardsProps {
  title?: string
  items: SummaryCardItem[]
}

function formatValue(value: number | string, format: SummaryCardItem['format'] = 'text') {
  if (typeof value === 'string') return value
  if (format === 'currency') return formatCurrency(value)
  if (format === 'number') return formatNumber(value)
  return String(value)
}

export function ReportSummaryCards({ title, items }: ReportSummaryCardsProps) {
  return (
    <div className="space-y-4">
      {title ? <h3 className="text-base font-semibold">{title}</h3> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.label} className="report-print-section">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {formatValue(item.value, item.format)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function RevenueCard({ value, label = 'Total Revenue' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'currency' }]} />
}

export function InventoryCard({ value, label = 'Inventory Value' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'currency' }]} />
}

export function PurchaseCard({ value, label = 'Total Purchases' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'currency' }]} />
}

export function CustomerCard({ value, label = 'Total Customers' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'number' }]} />
}

export function SupplierCard({ value, label = 'Total Suppliers' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'number' }]} />
}

export function ProfitCard({ value, label = 'Net Profit' }: { value: number; label?: string }) {
  return <ReportSummaryCards items={[{ label, value, format: 'currency' }]} />
}
