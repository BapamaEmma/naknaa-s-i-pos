import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import type { DashboardLowStockItem } from '@/features/dashboard/types'
import { cn } from '@/lib/utils'

interface LowStockTableProps {
  items: DashboardLowStockItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All products are adequately stocked.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Minimum Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(item.isCritical && 'bg-red-50/70 dark:bg-red-950/20')}
                  >
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.variantName}</TableCell>
                    <TableCell className="text-right">{item.currentStock}</TableCell>
                    <TableCell className="text-right">{item.minimumStock}</TableCell>
                    <TableCell>
                      <Badge variant={item.isCritical ? 'destructive' : 'warning'}>
                        {item.isCritical ? 'Critical' : 'Low Stock'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to={INVENTORY_ROUTES.LOW_STOCK}>View Inventory</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
