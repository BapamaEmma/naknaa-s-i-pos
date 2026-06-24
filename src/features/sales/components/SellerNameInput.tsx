import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SellerNameInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
}

export function SellerNameInput({ value, onChange, error }: SellerNameInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seller Name</CardTitle>
        <CardDescription>
          Enter your name as it should appear on the customer receipt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="seller-name">Name on receipt *</Label>
        <Input
          id="seller-name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. Ama Mensah"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
