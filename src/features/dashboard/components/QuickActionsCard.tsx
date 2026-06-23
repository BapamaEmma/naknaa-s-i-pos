import { Link } from 'react-router-dom'
import {
  BarChart3,
  PackagePlus,
  ShoppingCart,
  Truck,
  UserPlus,
  Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { SALES_ROUTES } from '@/features/sales/constants'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import { ROUTES } from '@/constants/routes'

const actions = [
  { label: 'New Sale', href: SALES_ROUTES.NEW, icon: ShoppingCart },
  { label: 'Add Product', href: PRODUCT_ROUTES.CREATE, icon: PackagePlus },
  { label: 'Stock In', href: INVENTORY_ROUTES.STOCK_IN, icon: Warehouse },
  { label: 'Add Customer', href: CUSTOMER_ROUTES.CREATE, icon: UserPlus },
  { label: 'Create Purchase', href: PURCHASE_ROUTES.CREATE, icon: Truck },
  { label: 'View Reports', href: ROUTES.REPORTS, icon: BarChart3 },
]

export function QuickActionsCard() {
  return (
    <Card className="h-fit self-start shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-1.5 pt-0">
        {actions.map(({ label, href, icon: Icon }) => (
          <Button key={label} variant="outline" size="sm" className="h-8 justify-start px-2.5" asChild>
            <Link to={href}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
