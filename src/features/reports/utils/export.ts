export interface ExportColumn<T> {
  header: string
  value: (row: T) => string | number
}

function escapeCsvValue(value: string | number): string {
  const text = String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function exportToExcel<T>(filename: string, columns: ExportColumn<T>[], rows: T[]): void {
  const header = columns.map((column) => escapeCsvValue(column.header)).join(',')
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(','))
    .join('\n')

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function printReport(title: string): void {
  document.body.dataset.printTitle = title
  window.print()
  delete document.body.dataset.printTitle
}

export function exportToPdf(title: string, htmlContent: string): void {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!printWindow) {
    printReport(title)
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          p { color: #555; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated ${new Date().toLocaleString('en-GH')}</p>
        ${htmlContent}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

export function tableToHtml<T>(columns: ExportColumn<T>[], rows: T[]): string {
  const header = columns.map((column) => `<th>${column.header}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((column) => `<td>${column.value(row)}</td>`).join('')}</tr>`,
    )
    .join('')

  return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`
}
