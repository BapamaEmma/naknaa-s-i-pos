import { StickyNote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Customer } from '@/features/customers/types'

interface CustomerNotesCardProps {
  customer: Customer
}

export function CustomerNotesCard({ customer }: CustomerNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="h-4 w-4" />
          Customer Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-foreground">
          {customer.notes || 'No notes added for this customer yet.'}
        </p>
      </CardContent>
    </Card>
  )
}
