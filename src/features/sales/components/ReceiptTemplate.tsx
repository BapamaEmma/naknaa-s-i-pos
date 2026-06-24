import { forwardRef } from 'react'
import naknaaLogo from '@/assets/naknaa-logo.png'
import { APP_NAME } from '@/constants/navigation'
import { PAYMENT_METHOD_LABELS, type ReceiptWidth } from '@/features/sales/constants'
import type { ReceiptData } from '@/features/sales/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ReceiptTemplateProps {
  receipt: ReceiptData
  width: ReceiptWidth
}

function ReceiptDivider({ className }: { className?: string }) {
  return <div className={cn('border-t border-dashed border-black', className)} />
}

function ReceiptRow({
  label,
  value,
  bold,
  compact,
  isNarrow,
}: {
  label: string
  value: string
  bold?: boolean
  compact?: boolean
  isNarrow: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3',
        compact
          ? isNarrow
            ? 'text-xs leading-5'
            : 'text-sm leading-5'
          : isNarrow
            ? 'text-sm leading-5'
            : 'text-base leading-6',
        bold && (isNarrow ? 'text-base font-bold' : 'text-lg font-bold'),
      )}
    >
      <span className="shrink-0 text-black/70">{label}</span>
      <span className={cn('text-right break-words', bold ? 'font-bold' : 'font-semibold')}>{value}</span>
    </div>
  )
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  function ReceiptTemplate({ receipt, width }, ref) {
    const isNarrow = width === '58mm'
    const widthClass = isNarrow ? 'max-w-[58mm]' : 'max-w-[80mm]'
    const logoClass = isNarrow ? 'max-h-14' : 'max-h-20'
    const baseText = isNarrow ? 'text-sm leading-5' : 'text-base leading-6'
    const titleText = isNarrow ? 'text-base' : 'text-xl'
    const totalText = isNarrow ? 'text-lg' : 'text-2xl'
    const qtyCol = isNarrow ? '32px' : '40px'
    const amountCol = isNarrow ? '68px' : '88px'

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full bg-white text-black print:bg-white print:text-black',
          'font-mono antialiased',
          baseText,
          widthClass,
          isNarrow ? 'p-3 print:p-2' : 'p-5 print:p-4',
        )}
      >
        <header className="space-y-2 text-center">
          <img
            src={naknaaLogo}
            alt={APP_NAME}
            className={cn('mx-auto w-auto object-contain', logoClass)}
          />
          <div className="space-y-1">
            <p className={cn('font-bold uppercase tracking-wide', titleText)}>{APP_NAME}</p>
            <p className="font-medium text-black/80">{receipt.branchName}</p>
            <p
              className={cn(
                'font-semibold uppercase tracking-[0.15em] text-black/60',
                isNarrow ? 'text-xs' : 'text-sm',
              )}
            >
              Sales Receipt
            </p>
          </div>
        </header>

        <ReceiptDivider className="my-4" />

        <section className="space-y-2" aria-label="Receipt details">
          <ReceiptRow isNarrow={isNarrow} label="Receipt No." value={receipt.receiptNumber} bold />
          <ReceiptRow isNarrow={isNarrow} label="Date & Time" value={formatDateTime(receipt.saleDate)} />
          <ReceiptRow isNarrow={isNarrow} label="Customer" value={receipt.customerName} />
          {receipt.customerPhone && receipt.customerPhone !== '-' ? (
            <ReceiptRow isNarrow={isNarrow} label="Phone" value={receipt.customerPhone} compact />
          ) : null}
        </section>

        <ReceiptDivider className="my-4" />

        <section aria-label="Items purchased">
          <div
            className={cn(
              'mb-3 grid gap-2 font-bold uppercase tracking-wide text-black/70',
              isNarrow ? 'text-xs' : 'text-sm',
            )}
            style={{ gridTemplateColumns: `${qtyCol} 1fr ${amountCol}` }}
          >
            <span>Qty</span>
            <span>Item</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="space-y-4">
            {receipt.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-x-2 gap-y-1"
                style={{ gridTemplateColumns: `${qtyCol} 1fr ${amountCol}` }}
              >
                <span className="text-base font-bold">{item.quantity}</span>
                <div className="min-w-0">
                  <p className="break-words text-base font-bold leading-snug">{item.productName}</p>
                  <p className="text-sm text-black/65">{formatCurrency(item.unitPrice)} each</p>
                </div>
                <span className="text-right text-base font-bold leading-snug">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <ReceiptDivider className="my-4" />

        <section className="space-y-2" aria-label="Payment summary">
          <ReceiptRow isNarrow={isNarrow} label="Subtotal" value={formatCurrency(receipt.subtotal)} />
          {receipt.discount > 0 ? (
            <ReceiptRow
              isNarrow={isNarrow}
              label="Discount"
              value={`-${formatCurrency(receipt.discount)}`}
            />
          ) : null}
          <ReceiptDivider className="my-2 border-solid border-black" />
          <div className={cn('flex items-center justify-between gap-3 font-bold', totalText)}>
            <span>GRAND TOTAL</span>
            <span>{formatCurrency(receipt.totalAmount)}</span>
          </div>
        </section>

        <ReceiptDivider className="my-4" />

        <section className="space-y-2" aria-label="Payment information">
          <ReceiptRow
            isNarrow={isNarrow}
            label="Payment Method"
            value={PAYMENT_METHOD_LABELS[receipt.paymentMethod]}
          />
          <ReceiptRow isNarrow={isNarrow} label="Sold By" value={receipt.cashierName} />
        </section>

        <ReceiptDivider className="my-5" />

        <footer className="space-y-2 text-center">
          <p
            className={cn(
              'font-bold uppercase tracking-wide',
              isNarrow ? 'text-sm' : 'text-base',
            )}
          >
            Thank You For Shopping With Us!
          </p>
          <p className={cn('text-black/60', isNarrow ? 'text-xs' : 'text-sm')}>
            Please keep this receipt for your records.
          </p>
        </footer>
      </div>
    )
  },
)
