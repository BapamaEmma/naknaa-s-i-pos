import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomerSelector } from '@/features/sales/components/CustomerSelector'
import { PaymentSelector } from '@/features/sales/components/PaymentSelector'
import { SalesCart } from '@/features/sales/components/SalesCart'
import { SalesSummary } from '@/features/sales/components/SalesSummary'
import { SellerNameInput } from '@/features/sales/components/SellerNameInput'
import type { CartItem, CustomerMode, PaymentMethod, SalesCustomerOption } from '@/features/sales/types'
import { formatCurrency } from '@/lib/format'

interface PosCartPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  subtotal: number
  discount: number
  grandTotal: number
  customerMode: CustomerMode
  customerId: string
  customerName: string
  customerPhone: string
  customers: SalesCustomerOption[]
  paymentMethod: PaymentMethod
  sellerName: string
  sellerNameError: string | null
  error: string | null
  isSubmitting?: boolean
  onIncrease: (productVariantId: string) => void
  onDecrease: (productVariantId: string) => void
  onRemove: (productVariantId: string) => void
  onCustomerModeChange: (mode: CustomerMode) => void
  onCustomerIdChange: (id: string) => void
  onCustomerNameChange: (name: string) => void
  onCustomerPhoneChange: (phone: string) => void
  onPaymentMethodChange: (method: PaymentMethod) => void
  onSellerNameChange: (name: string) => void
  onDiscountChange: (discount: number) => void
  onCompleteSale: () => void
}

export function PosCartPanel({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  grandTotal,
  customerMode,
  customerId,
  customerName,
  customerPhone,
  customers,
  paymentMethod,
  sellerName,
  sellerNameError,
  error,
  isSubmitting,
  onIncrease,
  onDecrease,
  onRemove,
  onCustomerModeChange,
  onCustomerIdChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onPaymentMethodChange,
  onSellerNameChange,
  onDiscountChange,
  onCompleteSale,
}: PosCartPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Your Cart</DialogTitle>
          <DialogDescription>
            {items.length === 0
              ? 'Tap products from the grid to add them here.'
              : `${items.length} line item${items.length === 1 ? '' : 's'} · ${formatCurrency(grandTotal)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <SalesCart
            items={items}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
          <CustomerSelector
            mode={customerMode}
            customerId={customerId}
            name={customerName}
            phone={customerPhone}
            customers={customers}
            onModeChange={onCustomerModeChange}
            onCustomerIdChange={onCustomerIdChange}
            onNameChange={onCustomerNameChange}
            onPhoneChange={onCustomerPhoneChange}
          />
          <SellerNameInput
            value={sellerName}
            onChange={onSellerNameChange}
            error={sellerNameError}
          />
          <PaymentSelector value={paymentMethod} onChange={onPaymentMethodChange} />
          <SalesSummary subtotal={subtotal} discount={discount} onDiscountChange={onDiscountChange} />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="border-t px-6 py-4">
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0 || isSubmitting}
            onClick={onCompleteSale}
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Sale · {formatCurrency(grandTotal)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
