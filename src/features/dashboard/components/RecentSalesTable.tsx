import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
import { SALES_ROUTES } from '@/features/sales/constants'
import type { DashboardRecentSale } from '@/features/dashboard/types'
import { formatCurrency, formatDateTime } from '@/lib/format'

interface RecentSalesTableProps {
  sales: DashboardRecentSale[]
}

function getSaleStatus(index: number): { label: string; variant: 'success' | 'default' } {
  return index % 4 === 0
    ? { label: 'In Progress', variant: 'default' }
    : { label: 'Delivered', variant: 'success' }
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <Card className="dashboard-card border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">Recent Invoice</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Latest completed and pending sales</p>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <Link to={SALES_ROUTES.HISTORY}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead>Invoice ID</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Sales Date</TableHead>
                <TableHead className="text-right">Paid Amount</TableHead>
                <TableHead>Sales Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale, index) => {
                const status = getSaleStatus(index)
                return (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-muted"
                        aria-label={`Expand ${sale.receiptNumber}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                    <TableCell className="hidden sm:table-cell">{sale.customerName}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDateTime(sale.saleDate)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(sale.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={status.variant}
                        className={
                          status.variant === 'default'
                            ? 'bg-violet-100 text-violet-700 hover:bg-violet-100'
                            : undefined
                        }
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="sm:hidden">
        <Button variant="outline" asChild className="w-full">
          <Link to={SALES_ROUTES.HISTORY}>View All Sales</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
