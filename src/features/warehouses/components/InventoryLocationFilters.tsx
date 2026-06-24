import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { InventoryLocationFilters } from '@/features/warehouses/types'
import { useCategories as useAllCategories } from '@/features/products/hooks/use-products'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'

interface InventoryLocationFiltersProps {
  filters: InventoryLocationFilters
  onChange: (filters: InventoryLocationFilters) => void
}

export function InventoryLocationFiltersBar({ filters, onChange }: InventoryLocationFiltersProps) {
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'all' })
  const { data: categories = [] } = useAllCategories()
  const warehouses = warehousesData?.data ?? []

  const update = (patch: Partial<InventoryLocationFilters>) =>
    onChange({ ...filters, ...patch, page: 1 })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="inventory-location-search">Search</Label>
          <Input
            id="inventory-location-search"
            placeholder="Product, warehouse, rack, or bin"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventory-warehouse-filter">Warehouse</Label>
          <Select
            id="inventory-warehouse-filter"
            value={filters.warehouseId ?? 'all'}
            onChange={(event) => update({ warehouseId: event.target.value })}
          >
            <option value="all">All warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventory-category-filter">Category</Label>
          <Select
            id="inventory-category-filter"
            value={filters.categoryId ?? 'all'}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="inventory-stock-filter">Stock Status</Label>
          <Select
            id="inventory-stock-filter"
            value={filters.stockStatus ?? 'all'}
            onChange={(event) =>
              update({ stockStatus: event.target.value as InventoryLocationFilters['stockStatus'] })
            }
          >
            <option value="all">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low">Low stock</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
