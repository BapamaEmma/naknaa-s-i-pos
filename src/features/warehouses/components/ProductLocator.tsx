import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, MapPin, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useProductAvailabilitySearch } from '@/features/warehouses/hooks/use-warehouses'

interface ProductLocatorProps {
  title?: string
  description?: string
  compact?: boolean
}

export function ProductLocator({
  title = 'Find Product in Warehouse',
  description = 'When a customer asks for an item, search by name, brand, and color to see which warehouse has stock.',
  compact = false,
}: ProductLocatorProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetching } = useProductAvailabilitySearch(debouncedSearch)
  const hasQuery = debouncedSearch.trim().length >= 2

  return (
    <Card className={compact ? 'shadow-sm' : undefined}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className={compact ? 'text-base' : undefined}>{title}</CardTitle>
        {!compact ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-locator-search">Search by item, brand, or color</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-locator-search"
              className="pl-9"
              placeholder="e.g. Fender bass guitar black"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Type the product name, brand, and color together — e.g. &quot;JBL SRX815 bass&quot; or &quot;Fender Stratocaster black&quot;.
          </p>
        </div>

        {!hasQuery ? (
          <p className="text-sm text-muted-foreground">
            Start typing to check warehouse availability without checking the book.
          </p>
        ) : isLoading || isFetching ? (
          <div className="flex min-h-24 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : data?.status === 'available' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{data.message}</p>
            </div>
            {data.results.map((result) => (
              <div key={result.productVariantId} className="rounded-lg border p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{result.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Brand: {result.brand} · Color: {result.color}
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {result.totalQuantity} available
                  </Badge>
                </div>
                <div className="space-y-2">
                  {result.locations.map((location) => (
                    <div
                      key={location.warehouseId}
                      className="flex items-center justify-between rounded-md bg-muted/40 p-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{location.warehouseName}</span>
                      </div>
                      <span className="font-semibold">{location.quantity} in stock</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">
                {data?.status === 'out_of_stock' ? 'Product not available' : 'No product found'}
              </p>
              <p>{data?.message ?? `No results for "${debouncedSearch}".`}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
