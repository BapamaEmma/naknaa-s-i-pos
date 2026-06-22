import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

interface SalesSummaryProps {
  subtotal: number
  discount: number
  onDiscountChange: (value: number) => void
}

export function SalesSummary({ subtotal, discount, onDiscountChange }: SalesSummaryProps) {
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal)
  const grandTotal = subtotal - safeDiscount

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Discount (GHS)</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            step="0.01"
            value={discount || ''}
            onChange={(event) => onDiscountChange(Number(event.target.value) || 0)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Grand Total</span>
          <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
