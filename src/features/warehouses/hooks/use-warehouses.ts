import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateLocationInput,
  CreateTransferInput,
  CreateWarehouseInput,
  CreateWarehouseStockInput,
  InventoryLocationFilters,
  LocationListFilters,
  TransferListFilters,
  UpdateLocationInput,
  UpdateWarehouseInput,
  WarehouseListFilters,
} from '@/features/warehouses/types'
import { warehouseService } from '@/services/warehouses/warehouseService'

function invalidateWarehouseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSES] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_LOCATIONS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_TRANSFERS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_SUMMARY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS] })
}

export function useWarehouseDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, 'dashboard'],
    queryFn: () => warehouseService.getDashboardSummary(),
  })
}

export function useWarehouseInventoryReport() {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, 'report'],
    queryFn: () => warehouseService.getInventoryReport(),
  })
}

export function useWarehouses(filters: WarehouseListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, filters],
    queryFn: () => warehouseService.getWarehouses(filters),
  })
}

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, 'detail', id],
    queryFn: () => warehouseService.getWarehouseById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseInput) => warehouseService.createWarehouse(input),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWarehouseInput }) =>
      warehouseService.updateWarehouse(id, input),
    onSuccess: (_data, variables) => {
      invalidateWarehouseQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSES, 'detail', variables.id] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useLocations(filters: LocationListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSE_LOCATIONS, filters],
    queryFn: () => warehouseService.getLocations(filters),
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLocationInput) => warehouseService.createLocation(input),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLocationInput }) =>
      warehouseService.updateLocation(id, input),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteLocation(id),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useInventoryLocations(filters: InventoryLocationFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSE_INVENTORY, filters],
    queryFn: () => warehouseService.getInventoryLocations(filters),
  })
}

export function useProductLocator(search: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, 'locator', search],
    queryFn: () => warehouseService.locateProduct(search),
    enabled: search.trim().length >= 2,
  })
}

export function useProductAvailabilitySearch(search: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, 'availability', search],
    queryFn: () => warehouseService.searchProductAvailability(search),
    enabled: search.trim().length >= 2,
  })
}

export function useTransfers(filters: TransferListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSE_TRANSFERS, filters],
    queryFn: () => warehouseService.getTransfers(filters),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransferInput) => warehouseService.createTransfer(input),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}

export function useAddWarehouseStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseStockInput) => warehouseService.addWarehouseStock(input),
    onSuccess: () => invalidateWarehouseQueries(queryClient),
  })
}
