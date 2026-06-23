import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UserActivityResult } from '@/features/users/types'
import { formatDate, formatDateTime } from '@/lib/format'

interface UserActivityTableProps {
  data?: UserActivityResult
  isLoading?: boolean
}

function splitDateTime(value: string) {
  const formatted = formatDateTime(value)
  const [date, time] = formatted.split(', ')
  return { date: date ?? formatted, time: time ?? '—' }
}

export function UserActivityTable({ data, isLoading }: UserActivityTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">No activity recorded</p>
        <p className="mt-1 text-sm text-muted-foreground">
          User actions will appear here as they use the system.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="hidden sm:table-cell">Time</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="hidden md:table-cell">Module</TableHead>
            <TableHead className="hidden lg:table-cell">Branch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((entry) => {
            const { time } = splitDateTime(entry.createdAt)

            return (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.createdAt)}</TableCell>
                <TableCell className="hidden sm:table-cell">{time}</TableCell>
                <TableCell className="font-medium">{entry.activity}</TableCell>
                <TableCell className="hidden md:table-cell">{entry.module}</TableCell>
                <TableCell className="hidden lg:table-cell">{entry.branchName}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
