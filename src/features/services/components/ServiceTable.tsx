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
import { SERVICE_ROUTES, SERVICE_STATUS_LABELS } from '@/features/services/constants'
import type { ServiceListItem, ServiceListResult } from '@/features/services/types'
import { formatCurrency } from '@/lib/format'

interface ServiceTableProps {
  data?: ServiceListResult
  isLoading?: boolean
  canManage?: boolean
  onDelete: (service: ServiceListItem) => void
}

export function ServiceTable({ data, isLoading, canManage = false, onDelete }: ServiceTableProps) {
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
        <p className="text-lg font-medium">No services found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new service.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Code</TableHead>
            <TableHead>Service Name</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-mono text-sm">{service.serviceCode}</TableCell>
              <TableCell>
                <Link
                  to={SERVICE_ROUTES.DETAIL(service.id)}
                  className="font-medium hover:underline"
                >
                  {service.serviceName}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{service.categoryName}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{service.categoryName}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(service.standardPrice)}
              </TableCell>
              <TableCell>
                <Badge variant={service.status === 'active' ? 'success' : 'secondary'}>
                  {SERVICE_STATUS_LABELS[service.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Actions for ${service.serviceName}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={SERVICE_ROUTES.DETAIL(service.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={SERVICE_ROUTES.EDIT(service.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDelete(service)}
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
