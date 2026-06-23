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
import type { SettingsAuditEntry } from '@/features/settings/types'

interface AuditSettingsTableProps {
  entries: SettingsAuditEntry[]
  isLoading?: boolean
}

function getCategoryVariant(category: SettingsAuditEntry['category']) {
  switch (category) {
    case 'security':
      return 'destructive' as const
    case 'user':
      return 'default' as const
    default:
      return 'secondary' as const
  }
}

export function AuditSettingsTable({ entries, isLoading }: AuditSettingsTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border">
        <LoadingSpinner />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border text-sm text-muted-foreground">
        No audit entries found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="hidden sm:table-cell">Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.user}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={getCategoryVariant(entry.category)} className="capitalize">
                  {entry.category}
                </Badge>
              </TableCell>
              <TableCell>{entry.date}</TableCell>
              <TableCell className="hidden md:table-cell">{entry.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
