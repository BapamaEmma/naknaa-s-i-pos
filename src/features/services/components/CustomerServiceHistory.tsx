import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SERVICE_JOB_STATUS_LABELS, SERVICE_ROUTES } from '@/features/services/constants'
import type { CustomerServiceHistoryItem, ServiceJobStatus } from '@/features/services/types'
import { formatCurrency, formatDate } from '@/lib/format'

function getJobStatusVariant(status: ServiceJobStatus) {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'pending':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    case 'cancelled':
      return 'secondary' as const
  }
}

interface CustomerServiceHistoryProps {
  items: CustomerServiceHistoryItem[]
  isLoading?: boolean
}

export function CustomerServiceHistory({ items, isLoading }: CustomerServiceHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border">
        <LoadingSpinner />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border text-sm text-muted-foreground">
        No service history found for this customer.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Number</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link
                  to={SERVICE_ROUTES.JOB_DETAIL(item.id)}
                  className="font-medium hover:underline"
                >
                  {item.jobNumber}
                </Link>
              </TableCell>
              <TableCell>{item.serviceName}</TableCell>
              <TableCell className="hidden sm:table-cell">{formatDate(item.serviceDate)}</TableCell>
              <TableCell>
                <Badge variant={getJobStatusVariant(item.status)}>
                  {SERVICE_JOB_STATUS_LABELS[item.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View job">
                  <Link to={SERVICE_ROUTES.JOB_DETAIL(item.id)}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
