import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { SERVICE_JOB_STATUS_LABELS, SERVICE_ROUTES } from '@/features/services/constants'
import type { ServiceJobListItem, ServiceJobListResult, ServiceJobStatus } from '@/features/services/types'
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

interface ServiceJobTableProps {
  data?: ServiceJobListResult
  isLoading?: boolean
  canManage?: boolean
  onDelete?: (job: ServiceJobListItem) => void
}

export function ServiceJobTable({
  data,
  isLoading,
  canManage = false,
  onDelete,
}: ServiceJobTableProps) {
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
        <p className="text-lg font-medium">No service jobs found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or create a new service job.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Number</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="hidden lg:table-cell">Technician</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <Link
                  to={SERVICE_ROUTES.JOB_DETAIL(job.id)}
                  className="font-medium hover:underline"
                >
                  {job.jobNumber}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{job.customerName}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{job.customerName}</TableCell>
              <TableCell>{job.serviceName}</TableCell>
              <TableCell className="hidden lg:table-cell">{job.technician}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(job.amount)}</TableCell>
              <TableCell>
                <Badge variant={getJobStatusVariant(job.status)}>
                  {SERVICE_JOB_STATUS_LABELS[job.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{formatDate(job.serviceDate)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${job.jobNumber}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={SERVICE_ROUTES.JOB_DETAIL(job.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={SERVICE_ROUTES.JOB_EDIT(job.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {onDelete ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => onDelete(job)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        ) : null}
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
