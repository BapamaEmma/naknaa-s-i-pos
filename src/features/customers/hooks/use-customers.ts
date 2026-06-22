import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateCustomerInput,
  CustomerListFilters,
  CustomerPurchaseFilters,
  UpdateCustomerInput,
} from '@/features/customers/types'
import { customerService } from '@/services/customers/customerService'

function invalidateCustomerQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS_SUMMARY] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] })
}

export function useCustomerSummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS_SUMMARY],
    queryFn: () => customerService.getCustomerSummary(),
  })
}

export function useCustomers(filters: CustomerListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, filters],
    queryFn: () => customerService.getCustomers(filters),
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'detail', id],
    queryFn: () => customerService.getCustomerById(id!),
    enabled: Boolean(id),
  })
}

export function useCustomerPurchases(
  customerId: string | undefined,
  filters: CustomerPurchaseFilters,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_PURCHASES, customerId, filters],
    queryFn: () => customerService.getCustomerPurchases(customerId!, filters),
    enabled: Boolean(customerId),
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerService.createCustomer(input),
    onSuccess: () => invalidateCustomerQueries(queryClient),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      customerService.updateCustomer(id, input),
    onSuccess: (_data, variables) => {
      invalidateCustomerQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_PURCHASES, variables.id] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => invalidateCustomerQueries(queryClient),
  })
}
