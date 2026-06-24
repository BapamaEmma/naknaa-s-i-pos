import { forwardRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { SERVICE_JOB_STATUS_LABELS } from '@/features/services/constants'
import type { ReceiptWidth } from '@/features/sales/constants'
import type { ServiceJobReceipt, ServiceJobStatus } from '@/features/services/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

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

interface ServiceReceiptTemplateProps {
  receipt: ServiceJobReceipt
  width?: ReceiptWidth
  className?: string
}

export const ServiceReceiptTemplate = forwardRef<HTMLDivElement, ServiceReceiptTemplateProps>(
  function ServiceReceiptTemplate({ receipt, width = '80mm', className }, ref) {
    const widthClass = width === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]'

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto bg-white p-6 font-mono text-sm text-black print:p-4',
          widthClass,
          className,
        )}
      >
        <div className="space-y-2 border-b border-dashed border-black pb-4 text-center">
          <p className="text-lg font-bold uppercase tracking-wide">{receipt.businessName}</p>
          <p className="text-xs uppercase text-muted-foreground">Service Receipt</p>
        </div>

        <div className="my-4 space-y-2">
          <div className="flex justify-between gap-4">
            <span>Job Number</span>
            <span className="font-semibold">{receipt.jobNumber}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Date</span>
            <span>{formatDate(receipt.serviceDate)}</span>
          </div>
          {receipt.completionDate ? (
            <div className="flex justify-between gap-4">
              <span>Completed</span>
              <span>{formatDate(receipt.completionDate)}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-y border-dashed border-black py-4">
          <div className="flex justify-between gap-4">
            <span>Customer</span>
            <span className="text-right font-medium">{receipt.customerName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Service</span>
            <span className="text-right font-medium">{receipt.serviceName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Technician</span>
            <span className="text-right">{receipt.technician}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Status</span>
            <Badge variant={getJobStatusVariant(receipt.status)} className="print:border print:border-black">
              {SERVICE_JOB_STATUS_LABELS[receipt.status]}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between py-4 text-lg font-bold">
          <span>Amount</span>
          <span>{formatCurrency(receipt.amount)}</span>
        </div>

        <p className="border-t border-dashed border-black pt-4 text-center text-xs">
          Issued {formatDate(receipt.issuedAt)} — Thank you for choosing {receipt.businessName}
        </p>
      </div>
    )
  },
)
