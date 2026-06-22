import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Product Search</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="product-search" className="sr-only">
          Search products
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="product-search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by product name, brand, or SKU (e.g. JBL, Fender, Yamaha)"
            className="pl-9"
          />
        </div>
      </CardContent>
    </Card>
  )
}
