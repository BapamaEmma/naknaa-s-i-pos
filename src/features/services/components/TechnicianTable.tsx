import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Technician } from '@/features/services/types'

interface TechnicianTableProps {
  technicians: Technician[]
  isLoading?: boolean
}

export function TechnicianTable({ technicians, isLoading }: TechnicianTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner />
      </div>
    )
  }

  if (technicians.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        No technicians found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Phone</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((technician) => (
            <TableRow key={technician.id}>
              <TableCell className="font-medium">{technician.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{technician.phoneNumber || '—'}</TableCell>
              <TableCell>{technician.specialization || '—'}</TableCell>
              <TableCell>
                <Badge variant={technician.status === 'active' ? 'success' : 'secondary'}>
                  {technician.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
