import { Eye, Printer, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PaymentMethodBadge } from '@/features/sales/components/PaymentMethodBadge'
import { SALES_ROUTES } from '@/features/sales/constants'
import type { SalesListResult } from '@/features/sales/types'
import { formatCurrency, formatDateTime } from '@/lib/format'

interface SalesTableProps {
  data?: SalesListResult
  isLoading?: boolean
}

export function SalesTable({ data, isLoading }: SalesTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border">
        <LoadingSpinner layout="inline" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No sales found for the selected filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Sold by</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-40" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
              <TableCell>{sale.customerName}</TableCell>
              <TableCell>{sale.cashierName}</TableCell>
              <TableCell>
                <PaymentMethodBadge method={sale.paymentMethod} />
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
              <TableCell>{formatDateTime(sale.saleDate)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View sale">
                    <Link to={SALES_ROUTES.DETAIL(sale.id)}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View receipt">
                    <Link to={SALES_ROUTES.RECEIPT(sale.id)}>
                      <Receipt className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Reprint receipt">
                    <Link to={`${SALES_ROUTES.RECEIPT(sale.id)}?reprint=1`}>
                      <Printer className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
