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

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  function ReceiptTemplate({ receipt, width }, ref) {
    const widthClass = width === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]'
    const logoClass = width === '58mm' ? 'max-h-14' : 'max-h-20'

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto bg-white p-4 font-mono text-base text-black print:p-2',
          widthClass,
        )}
      >
        <div className="space-y-2 text-center">
          <img
            src={naknaaLogo}
            alt={APP_NAME}
            className={cn('mx-auto w-auto object-contain', logoClass)}
          />
          <p className="text-lg font-bold uppercase tracking-wide">{APP_NAME}</p>
          <p className="text-sm">{receipt.branchName}</p>
        </div>

        <div className="my-4 space-y-1.5 text-sm">
          <p>Receipt: {receipt.receiptNumber}</p>
          <p>Date: {formatDateTime(receipt.saleDate)}</p>
          <p>Customer: {receipt.customerName}</p>
        </div>

        <div className="border-t border-dashed border-black py-3 text-sm">
          {receipt.items.map((item) => (
            <div key={item.id} className="mb-3 space-y-1">
              <p className="text-base font-semibold">{item.productName}</p>
              <p>{item.variantName}</p>
              <div className="flex justify-between gap-2">
                <span>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </span>
                <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 border-t border-dashed border-black py-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(receipt.subtotal)}</span>
          </div>
          {receipt.discount > 0 ? (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatCurrency(receipt.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(receipt.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-dashed border-black py-3 text-sm">
          <p>Payment: {PAYMENT_METHOD_LABELS[receipt.paymentMethod]}</p>
          <p>Cashier: {receipt.cashierName}</p>
        </div>

        <p className="border-t border-dashed border-black pt-4 text-center text-sm font-medium">
          Thank You For Your Business
        </p>
      </div>
    )
  },
)
