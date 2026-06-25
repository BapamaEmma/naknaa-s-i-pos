import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import type { SupplierListItem, SupplierListResult } from '@/features/suppliers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierTableProps {
  data?: SupplierListResult
  isLoading?: boolean
  onDelete: (supplier: SupplierListItem) => void
}

export function SupplierTable({ data, isLoading, onDelete }: SupplierTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">No suppliers found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new supplier.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier Name</TableHead>
            <TableHead className="hidden md:table-cell">Store</TableHead>
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            <TableHead className="hidden sm:table-cell">Products</TableHead>
            <TableHead className="text-right">Purchase Value</TableHead>
            <TableHead className="hidden xl:table-cell">Last Supply</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>
                <Link
                  to={SUPPLIER_ROUTES.DETAIL(supplier.id)}
                  className="font-medium hover:underline"
                >
                  {supplier.name}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{supplier.storeName || '—'}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{supplier.storeName || '—'}</TableCell>
              <TableCell className="hidden lg:table-cell">{supplier.phoneNumber || '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">{supplier.productCount}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(supplier.totalPurchaseValue)}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {supplier.lastSupplyDate ? formatDate(supplier.lastSupplyDate) : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${supplier.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={SUPPLIER_ROUTES.DETAIL(supplier.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={SUPPLIER_ROUTES.EDIT(supplier.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={SUPPLIER_ROUTES.PRODUCT_CREATE(supplier.id)}>
                        <Plus className="h-4 w-4" />
                        Add items
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(supplier)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
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
