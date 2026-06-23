import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreatePurchaseInput,
  CreatePurchaseOrderInput,
  PurchaseListFilters,
  ReceivePurchaseInput,
  UpdatePurchaseInput,
} from '@/features/purchases/types'
import { purchaseService } from '@/services/purchases/purchaseService'

function invalidatePurchaseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_HISTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_LOGS] })
}

export function usePurchaseDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'dashboard'],
    queryFn: () => purchaseService.getDashboardSummary(),
  })
}

export function usePurchaseReports() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'reports'],
    queryFn: () => purchaseService.getReports(),
  })
}

export function useSupplierPurchaseHistory() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'supplier-history'],
    queryFn: () => purchaseService.getSupplierPurchaseHistory(),
  })
}

export function useWarehousePurchaseSummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'warehouse-summary'],
    queryFn: () => purchaseService.getWarehousePurchaseSummary(),
  })
}

export function usePurchases(filters: PurchaseListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, filters],
    queryFn: () => purchaseService.getPurchases(filters),
  })
}

export function usePurchase(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'detail', id],
    queryFn: () => purchaseService.getPurchaseById(id!),
    enabled: Boolean(id),
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePurchaseInput) => purchaseService.createPurchase(input),
    onSuccess: () => invalidatePurchaseQueries(queryClient),
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePurchaseInput }) =>
      purchaseService.updatePurchase(id, input),
    onSuccess: (_data, variables) => {
      invalidatePurchaseQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES, 'detail', variables.id] })
    },
  })
}

export function useDeletePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId, userName }: { id: string; userId: string; userName: string }) =>
      purchaseService.deletePurchase(id, userId, userName),
    onSuccess: () => invalidatePurchaseQueries(queryClient),
  })
}

export function useReceivePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ReceivePurchaseInput) => purchaseService.receivePurchase(input),
    onSuccess: (_data, variables) => {
      invalidatePurchaseQueries(queryClient)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PURCHASES, 'detail', variables.purchaseId],
      })
    },
  })
}

export function useReceivablePurchases() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, 'receivable'],
    queryFn: () => purchaseService.getReceivablePurchases(),
  })
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS],
    queryFn: () => purchaseService.getPurchaseOrders(),
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => purchaseService.createPurchaseOrder(input),
    onSuccess: () => invalidatePurchaseQueries(queryClient),
  })
}
