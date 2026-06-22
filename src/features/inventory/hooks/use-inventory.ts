import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  InventoryAdjustmentInput,
  InventoryHistoryFilters,
  InventoryListFilters,
  StockInInput,
  StockOutInput,
} from '@/features/inventory/types'
import { inventoryService } from '@/services/inventory/inventoryService'

function invalidateInventoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_SUMMARY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_HISTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS] })
}

export function useInventoryBranches() {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, 'branches'],
    queryFn: () => inventoryService.getBranches(),
  })
}

export function useInventoryProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, 'products'],
    queryFn: () => inventoryService.getProductOptions(),
  })
}

export function useInventoryVariants(productId: string | undefined, branchId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, 'variants', productId, branchId],
    queryFn: () => inventoryService.getVariantOptions(productId!, branchId),
    enabled: Boolean(productId),
  })
}

export function useInventorySummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_SUMMARY],
    queryFn: () => inventoryService.getInventorySummary(),
  })
}

export function useInventory(filters: InventoryListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, filters],
    queryFn: () => inventoryService.getInventory(filters),
  })
}

export function useInventoryItem(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, 'detail', id],
    queryFn: () => inventoryService.getInventoryById(id!),
    enabled: Boolean(id),
  })
}

export function useInventoryHistory(filters: InventoryHistoryFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_HISTORY, filters],
    queryFn: () => inventoryService.getInventoryHistory(filters),
  })
}

export function useLowStockInventory(filters: InventoryListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY, 'low-stock', filters],
    queryFn: () => inventoryService.getLowStockProducts(filters),
  })
}

export function useStockIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StockInInput) => inventoryService.stockIn(input),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  })
}

export function useStockOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StockOutInput) => inventoryService.stockOut(input),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  })
}

export function useInventoryAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InventoryAdjustmentInput) => inventoryService.adjustInventory(input),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  })
}
