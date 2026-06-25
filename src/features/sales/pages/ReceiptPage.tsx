import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ReceiptTemplate } from '@/features/sales/components/ReceiptTemplate'
import { RECEIPT_WIDTHS, SALES_ROUTES, type ReceiptWidth } from '@/features/sales/constants'
import { useReceipt, useReprintReceipt } from '@/features/sales/hooks/use-sales'

export function ReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isReprint = searchParams.get('reprint') === '1'
  const receiptRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<ReceiptWidth>(RECEIPT_WIDTHS.MM_80)
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false)

  const { data: receipt, isLoading } = useReceipt(id)
  const reprintReceipt = useReprintReceipt()

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: receipt ? `Receipt-${receipt.receiptNumber}` : 'Receipt',
  })

  useEffect(() => {
    if (isReprint && receipt && !hasAutoPrinted) {
      reprintReceipt.mutate(receipt.id)
      setHasAutoPrinted(true)
    }
  }, [hasAutoPrinted, isReprint, receipt, reprintReceipt])

  useEffect(() => {
    if (isReprint && receipt && hasAutoPrinted) {
      const timer = window.setTimeout(() => handlePrint(), 400)
      return () => window.clearTimeout(timer)
    }
  }, [handlePrint, hasAutoPrinted, isReprint, receipt])

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <LoadingSpinner layout="inline" />
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit px-2">
          <Link to={SALES_ROUTES.HISTORY}>
            <ArrowLeft className="h-4 w-4" />
            Back to sales history
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Receipt not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3 w-fit px-2">
            <Link to={SALES_ROUTES.DETAIL(receipt.id)}>
              <ArrowLeft className="h-4 w-4" />
              Back to sale details
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isReprint ? 'Reprint Receipt' : 'Receipt Preview'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{receipt.receiptNumber}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="receipt-width">Printer Width</Label>
            <Select
              id="receipt-width"
              value={width}
              onChange={(event) => setWidth(event.target.value as ReceiptWidth)}
            >
              <option value={RECEIPT_WIDTHS.MM_58}>58mm Thermal</option>
              <option value={RECEIPT_WIDTHS.MM_80}>80mm Thermal</option>
            </Select>
          </div>
          <Button onClick={() => handlePrint()}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <ReceiptTemplate ref={receiptRef} receipt={receipt} width={width} />
        </CardContent>
      </Card>
    </div>
  )
}
