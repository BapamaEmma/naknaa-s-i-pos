import { Link, useParams } from 'react-router-dom'
import { Printer, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/sales/components/PageHeader'
import { PaymentMethodBadge } from '@/features/sales/components/PaymentMethodBadge'
import { SALES_ROUTES } from '@/features/sales/constants'
import { useSale } from '@/features/sales/hooks/use-sales'
import { formatCurrency, formatDateTime } from '@/lib/format'

export function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: sale, isLoading } = useSale(id)

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Sale Not Found" backTo={SALES_ROUTES.HISTORY} backLabel="Back to sales history" />
        <p className="text-sm text-muted-foreground">The requested sale could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Sale ${sale.receiptNumber}`}
        description="View sale information and purchased items."
        backTo={SALES_ROUTES.HISTORY}
        backLabel="Back to sales history"
        action={
          <>
            <Button variant="outline" asChild>
              <Link to={SALES_ROUTES.RECEIPT(sale.id)}>
                <Receipt className="h-4 w-4" />
                View Receipt
              </Link>
            </Button>
            <Button asChild>
              <Link to={`${SALES_ROUTES.RECEIPT(sale.id)}?reprint=1`}>
                <Printer className="h-4 w-4" />
                Reprint Receipt
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Receipt Number</span>
              <span className="font-medium">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-right">{sale.customerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Payment Method</span>
              <PaymentMethodBadge method={sale.paymentMethod} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Sold by</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Branch</span>
              <span>{sale.branchName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Sale Date</span>
              <span>{formatDateTime(sale.saleDate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Grand Total</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items Purchased</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.variantName}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
