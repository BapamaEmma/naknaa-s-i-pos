import { Link } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  History,
  TriangleAlert,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'

const actions = [
  {
    title: 'Stock In',
    description: 'Receive new inventory into a branch.',
    href: INVENTORY_ROUTES.STOCK_IN,
    icon: ArrowDownToLine,
  },
  {
    title: 'Stock Out',
    description: 'Remove stock for damage, loss, or internal use.',
    href: INVENTORY_ROUTES.STOCK_OUT,
    icon: ArrowUpFromLine,
  },
  {
    title: 'Adjustment',
    description: 'Correct stock discrepancies after counts.',
    href: INVENTORY_ROUTES.ADJUSTMENT,
    icon: ClipboardList,
  },
  {
    title: 'Low Stock',
    description: 'View items below minimum stock levels.',
    href: INVENTORY_ROUTES.LOW_STOCK,
    icon: TriangleAlert,
  },
  {
    title: 'History',
    description: 'Review all inventory transactions.',
    href: INVENTORY_ROUTES.HISTORY,
    icon: History,
  },
]

export function InventoryQuickActions() {
  const primaryActions = actions.slice(0, 3)
  const secondaryActions = actions.slice(3)

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Common inventory tasks and reports.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {primaryActions.map((action) => (
          <Card key={action.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <action.icon className="h-4 w-4" />
                {action.title}
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to={action.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {secondaryActions.map((action) => (
          <Card key={action.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <action.icon className="h-4 w-4" />
                {action.title}
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to={action.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
