import { Link } from 'react-router-dom'
import { Eye, History, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { CUSTOMER_ROUTES, CUSTOMER_STATUS_LABELS } from '@/features/customers/constants'
import type { CustomerListItem, CustomerListResult } from '@/features/customers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface CustomerTableProps {
  data?: CustomerListResult
  isLoading?: boolean
  onDelete: (customer: CustomerListItem) => void
}

export function CustomerTable({ data, isLoading, onDelete }: CustomerTableProps) {
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
        <p className="text-lg font-medium">No customers found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new customer.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Code</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead className="hidden md:table-cell">Phone Number</TableHead>
            <TableHead className="hidden lg:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Total Purchases</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Registration Date</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.customerCode}</TableCell>
              <TableCell>
                <Link
                  to={CUSTOMER_ROUTES.DETAIL(customer.id)}
                  className="font-medium hover:underline"
                >
                  {customer.fullName}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{customer.phoneNumber}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{customer.phoneNumber}</TableCell>
              <TableCell className="hidden lg:table-cell">{customer.email || '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">{customer.totalPurchases}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(customer.totalAmountSpent)}
              </TableCell>
              <TableCell>
                <Badge variant={customer.status === 'active' ? 'success' : 'secondary'}>
                  {CUSTOMER_STATUS_LABELS[customer.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {formatDate(customer.registrationDate)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${customer.fullName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={CUSTOMER_ROUTES.DETAIL(customer.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={CUSTOMER_ROUTES.EDIT(customer.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={CUSTOMER_ROUTES.PURCHASES(customer.id)}>
                        <History className="h-4 w-4" />
                        Purchase History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(customer)}
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
