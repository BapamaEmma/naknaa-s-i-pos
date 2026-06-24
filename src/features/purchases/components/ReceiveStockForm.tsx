import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PurchaseItemsTable } from '@/features/purchases/components/PurchaseItemsTable'
import {
  receivePurchaseSchema,
  type ReceivePurchaseFormInput,
  type ReceivePurchaseFormOutput,
} from '@/features/purchases/schemas/purchase.schema'
import { useReceivablePurchases } from '@/features/purchases/hooks/use-purchases'

interface ReceiveStockFormProps {
  selectedPurchaseId?: string
  isSubmitting?: boolean
  onSubmit: (values: ReceivePurchaseFormOutput) => Promise<void>
}

export function ReceiveStockForm({
  selectedPurchaseId,
  isSubmitting,
  onSubmit,
}: ReceiveStockFormProps) {
  const { data: purchases = [], isLoading } = useReceivablePurchases()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReceivePurchaseFormInput, unknown, ReceivePurchaseFormOutput>({
    resolver: zodResolver(receivePurchaseSchema),
    defaultValues: {
      purchaseId: selectedPurchaseId ?? '',
      items: [],
    },
  })

  const purchaseId = watch('purchaseId')
  const selectedPurchase = purchases.find((entry) => entry.id === purchaseId)

  useEffect(() => {
    if (selectedPurchaseId) {
      setValue('purchaseId', selectedPurchaseId)
    }
  }, [selectedPurchaseId, setValue])

  useEffect(() => {
    if (selectedPurchase) {
      reset({
        purchaseId: selectedPurchase.id,
        items: selectedPurchase.items.map((item) => ({
          purchaseItemId: item.id,
          quantity: Math.max(item.quantity - item.receivedQuantity, 0),
        })),
      })
    }
  }, [selectedPurchase, reset])

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Purchase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseId">Purchase *</Label>
            <Select
              id="purchaseId"
              value={purchaseId}
              onChange={(event) => setValue('purchaseId', event.target.value)}
            >
              <option value="">Select purchase to receive</option>
              {purchases.map((purchase) => (
                <option key={purchase.id} value={purchase.id}>
                  {purchase.purchaseNumber} · {purchase.supplierName}
                </option>
              ))}
            </Select>
            {errors.purchaseId ? (
              <p className="text-sm text-destructive">{errors.purchaseId.message}</p>
            ) : null}
          </div>

          {selectedPurchase ? (
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{selectedPurchase.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="font-medium">{selectedPurchase.warehouseName}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedPurchase ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ordered vs Received</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseItemsTable items={selectedPurchase.items} showReceiving />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receive Quantities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPurchase.items.map((item, index) => {
                const remaining = Math.max(item.quantity - item.receivedQuantity, 0)
                return (
                  <div key={item.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
                    <input type="hidden" {...register(`items.${index}.purchaseItemId`)} value={item.id} />
                    <div className="md:col-span-2">
                      <p className="font-medium">
                        {item.productName} · {item.variantName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: {item.quantity} · Received: {item.receivedQuantity} · Remaining: {remaining}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`receive-${item.id}`}>Receive Now</Label>
                      <Input
                        id={`receive-${item.id}`}
                        type="number"
                        min={0}
                        max={remaining}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !selectedPurchase}>
          {isSubmitting ? 'Receiving...' : 'Receive Stock'}
        </Button>
      </div>
    </form>
  )
}
