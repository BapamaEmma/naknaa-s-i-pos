import { FileDown, FileSpreadsheet, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToExcel, exportToPdf, printReport, tableToHtml, type ExportColumn } from '@/features/reports/utils/export'
import { canExportReports } from '@/features/reports/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface ExportButtonsProps<T> {
  title: string
  filename: string
  columns: ExportColumn<T>[]
  rows: T[]
}

export function ExportButtons<T>({ title, filename, columns, rows }: ExportButtonsProps<T>) {
  const { user } = useAuth()
  const canExport = user ? canExportReports(user.role) : false

  if (!canExport) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportToExcel(filename, columns, rows)}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportToPdf(title, tableToHtml(columns, rows))}
      >
        <FileDown className="h-4 w-4" />
        Export PDF
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => printReport(title)}>
        <Printer className="h-4 w-4" />
        Print Report
      </Button>
    </div>
  )
}
