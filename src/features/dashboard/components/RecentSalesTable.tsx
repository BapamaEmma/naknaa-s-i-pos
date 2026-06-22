import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentMethodBadge } from '@/features/sales/components/PaymentMethodBadge'
import { SALES_ROUTES } from '@/features/sales/constants'
import type { DashboardRecentSale } from '@/features/dashboard/types'
import { formatCurrency, formatDateTime } from '@/lib/format'

interface RecentSalesTableProps {
  sales: DashboardRecentSale[]
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sale.amount)}
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={sale.paymentMethod} />
                  </TableCell>
                  <TableCell>{formatDateTime(sale.saleDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to={SALES_ROUTES.HISTORY}>View All Sales</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
