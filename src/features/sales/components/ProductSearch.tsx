import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="product-search">Product Search</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="product-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by product name or brand (e.g. JBL, Fender, Yamaha)"
          className="h-9 pl-9"
        />
      </div>
    </div>
  )
}
