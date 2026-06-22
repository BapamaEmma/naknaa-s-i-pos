import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomerSelector } from '@/features/sales/components/CustomerSelector'
import { PageHeader } from '@/features/sales/components/PageHeader'
import { PaymentSelector } from '@/features/sales/components/PaymentSelector'
import { ProductResults } from '@/features/sales/components/ProductResults'
import { ProductSearch } from '@/features/sales/components/ProductSearch'
import { SalesCart } from '@/features/sales/components/SalesCart'
import { SalesStatsCards } from '@/features/sales/components/SalesStatsCards'
import { SalesSummary } from '@/features/sales/components/SalesSummary'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import { useInventoryBranches } from '@/features/inventory/hooks/use-inventory'
import { WALK_IN_CUSTOMER, SALES_ROUTES } from '@/features/sales/constants'
import {
  useCreateSale,
  usePosProducts,
  useSalesCustomers,
  useSalesSummary,
} from '@/features/sales/hooks/use-sales'
import type { CartItem, CustomerMode, PaymentMethod, PosProductResult } from '@/features/sales/types'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/format'

export function PosSalesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [branchId, setBranchId] = useState(DEFAULT_BRANCH_ID)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerMode, setCustomerMode] = useState<CustomerMode>('walk_in')
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState<string>(WALK_IN_CUSTOMER.name)
  const [customerPhone, setCustomerPhone] = useState<string>(WALK_IN_CUSTOMER.phone)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [discount, setDiscount] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: branches = [] } = useInventoryBranches()
  const { data: customers = [] } = useSalesCustomers()
  const { data: summary, isLoading: summaryLoading } = useSalesSummary()
  const { data: products = [], isLoading: productsLoading } = usePosProducts(search, branchId)
  const createSale = useCreateSale()

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart],
  )
  const grandTotal = Math.max(subtotal - discount, 0)

  const addToCart = (product: PosProductResult) => {
    setCart((current) => {
      const existing = current.find((item) => item.productVariantId === product.productVariantId)

      if (existing) {
        if (existing.quantity >= product.availableStock) return current
        return current.map((item) =>
          item.productVariantId === product.productVariantId
            ? { ...item, quantity: item.quantity + 1, availableStock: product.availableStock }
            : item,
        )
      }

      return [
        ...current,
        {
          productId: product.productId,
          productVariantId: product.productVariantId,
          productName: product.productName,
          variantName: product.variantName,
          brand: product.brand,
          sku: product.sku,
          imageUrl: product.imageUrl,
          quantity: 1,
          unitPrice: product.sellingPrice,
          availableStock: product.availableStock,
        },
      ]
    })
  }

  const updateQuantity = (productVariantId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.productVariantId !== productVariantId) return item
          const nextQuantity = item.quantity + delta
          if (nextQuantity <= 0) return null
          if (nextQuantity > item.availableStock) return item
          return { ...item, quantity: nextQuantity }
        })
        .filter((item): item is CartItem => Boolean(item)),
    )
  }

  const removeFromCart = (productVariantId: string) => {
    setCart((current) => current.filter((item) => item.productVariantId !== productVariantId))
  }

  const handleCompleteSale = async () => {
    if (!user) return

    setError(null)

    try {
      const sale = await createSale.mutateAsync({
        branchId,
        customerId: customerMode === 'existing' ? customerId : null,
        customerName,
        customerPhone,
        paymentMethod,
        discount,
        cashierId: user.id,
        cashierName: `${user.firstName} ${user.lastName}`,
        items: cart.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })

      setConfirmOpen(false)
      setCart([])
      setDiscount(0)
      setCustomerMode('walk_in')
      setCustomerId('')
      setCustomerName(WALK_IN_CUSTOMER.name)
      setCustomerPhone(WALK_IN_CUSTOMER.phone)
      setPaymentMethod('cash')
      navigate(SALES_ROUTES.RECEIPT(sale.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to complete sale.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="POS Sales"
        description="Search products, build a cart, and complete sales at the register."
        action={
          <Button variant="outline" asChild>
            <Link to={SALES_ROUTES.HISTORY}>
              <History className="h-4 w-4" />
              Sales History
            </Link>
          </Button>
        }
      />

      <SalesStatsCards summary={summary} isLoading={summaryLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductSearch value={search} onChange={setSearch} />
          <div className="space-y-2">
            <Label htmlFor="pos-branch">Branch</Label>
            <Select
              id="pos-branch"
              value={branchId}
              onChange={(event) => {
                setBranchId(event.target.value)
                setCart([])
              }}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>
          <ProductResults products={products} isLoading={productsLoading} onAddToCart={addToCart} />
        </div>

        <div className="space-y-4">
          <SalesCart
            items={cart}
            onIncrease={(id) => updateQuantity(id, 1)}
            onDecrease={(id) => updateQuantity(id, -1)}
            onRemove={removeFromCart}
          />
          <CustomerSelector
            mode={customerMode}
            customerId={customerId}
            name={customerName}
            phone={customerPhone}
            customers={customers}
            onModeChange={setCustomerMode}
            onCustomerIdChange={setCustomerId}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
          />
          <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
          <SalesSummary subtotal={subtotal} discount={discount} onDiscountChange={setDiscount} />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            size="lg"
            className="w-full"
            disabled={cart.length === 0 || createSale.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Sale
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Sale</DialogTitle>
            <DialogDescription>
              Review the order before completing. Inventory will be deducted automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span>{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteSale} disabled={createSale.isPending}>
              {createSale.isPending ? 'Processing...' : 'Confirm & Print Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
