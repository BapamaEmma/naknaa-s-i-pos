import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, PackageCheck, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  PAYMENT_STATUS_LABELS,
  PURCHASE_ROUTES,
  PURCHASE_STATUS_LABELS,
} from '@/features/purchases/constants'
import type { PurchaseListResult, PurchaseListItem, PaymentStatus, PurchaseStatus } from '@/features/purchases/types'
import { formatCurrency, formatDate } from '@/lib/format'

function getPurchaseStatusVariant(status: PurchaseStatus) {
  switch (status) {
    case 'received':
      return 'success' as const
    case 'partially_received':
      return 'warning' as const
    case 'ordered':
      return 'default' as const
    case 'cancelled':
      return 'destructive' as const
    default:
      return 'secondary' as const
  }
}

function getPaymentStatusVariant(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return 'success' as const
    case 'partial':
      return 'warning' as const
    default:
      return 'secondary' as const
  }
}

interface PurchaseTableProps {
  data?: PurchaseListResult
  isLoading?: boolean
  canManage?: boolean
  canReceive?: boolean
  onDelete?: (purchase: PurchaseListItem) => void
}

export function PurchaseTable({
  data,
  isLoading,
  canManage = false,
  canReceive = false,
  onDelete,
}: PurchaseTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">No purchases found</p>
        <p className="mt-1 text-sm text-muted-foreground">Create a purchase to record supplier orders.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purchase Number</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="hidden md:table-cell">Warehouse</TableHead>
            <TableHead className="hidden lg:table-cell">Invoice</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>
                <Link to={PURCHASE_ROUTES.DETAIL(purchase.id)} className="font-medium hover:underline">
                  {purchase.purchaseNumber}
                </Link>
              </TableCell>
              <TableCell>{purchase.supplierName}</TableCell>
              <TableCell className="hidden md:table-cell">{purchase.warehouseName}</TableCell>
              <TableCell className="hidden lg:table-cell">{purchase.invoiceNumber || '—'}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(purchase.totalAmount)}</TableCell>
              <TableCell>
                <Badge variant={getPaymentStatusVariant(purchase.paymentStatus)}>
                  {PAYMENT_STATUS_LABELS[purchase.paymentStatus]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPurchaseStatusVariant(purchase.purchaseStatus)}>
                  {PURCHASE_STATUS_LABELS[purchase.purchaseStatus]}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{formatDate(purchase.purchaseDate)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${purchase.purchaseNumber}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={PURCHASE_ROUTES.DETAIL(purchase.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <DropdownMenuItem asChild>
                        <Link to={PURCHASE_ROUTES.EDIT(purchase.id)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canReceive &&
                    (purchase.purchaseStatus === 'ordered' ||
                      purchase.purchaseStatus === 'partially_received') ? (
                      <DropdownMenuItem asChild>
                        <Link to={`${PURCHASE_ROUTES.RECEIVE}?purchaseId=${purchase.id}`}>
                          <PackageCheck className="h-4 w-4" />
                          Receive Stock
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canManage && onDelete ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDelete(purchase)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
