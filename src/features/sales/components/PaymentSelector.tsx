import { CreditCard } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PAYMENT_METHODS } from '@/features/sales/constants'
import type { PaymentMethod } from '@/features/sales/types'

interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
}

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Payment Method
        </CardTitle>
        <CardDescription>Cash and Mobile Money are available. Card and bank transfer coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="payment-method">Select payment method</Label>
          <Select
            id="payment-method"
            value={value}
            onChange={(event) => onChange(event.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
