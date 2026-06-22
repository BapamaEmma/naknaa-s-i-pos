import { Badge } from '@/components/ui/badge'
import { PAYMENT_METHOD_LABELS } from '@/features/sales/constants'
import type { PaymentMethod } from '@/features/sales/types'

interface PaymentMethodBadgeProps {
  method: PaymentMethod
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  return <Badge variant="secondary">{PAYMENT_METHOD_LABELS[method]}</Badge>
}
