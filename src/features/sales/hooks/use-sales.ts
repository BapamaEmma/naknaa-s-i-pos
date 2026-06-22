import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type { CreateSaleInput, SalesListFilters } from '@/features/sales/types'
import { salesService } from '@/services/sales/salesService'

function invalidateSalesQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES_SUMMARY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_SUMMARY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_HISTORY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS] })
}

export function useSalesSummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_SUMMARY],
    queryFn: () => salesService.getSalesSummary(),
  })
}

export function useSales(filters: SalesListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES, filters],
    queryFn: () => salesService.getSales(filters),
  })
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES, 'detail', id],
    queryFn: () => salesService.getSaleById(id!),
    enabled: Boolean(id),
  })
}

export function useReceipt(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_RECEIPT, id],
    queryFn: () => salesService.getReceipt(id!),
    enabled: Boolean(id),
  })
}

export function usePosProducts(search: string, branchId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES, 'products', search, branchId],
    queryFn: () => salesService.searchProducts(search, branchId),
  })
}

export function useSalesCustomers() {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES, 'customers'],
    queryFn: () => salesService.getCustomers(),
  })
}

export function useSalesCashiers() {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES, 'cashiers'],
    queryFn: () => salesService.getCashiers(),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSaleInput) => salesService.createSale(input),
    onSuccess: () => invalidateSalesQueries(queryClient),
  })
}

export function useReprintReceipt() {
  return useMutation({
    mutationFn: (id: string) => salesService.reprintReceipt(id),
  })
}
