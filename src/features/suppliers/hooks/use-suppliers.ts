import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateSupplierInput,
  CreateSupplierProductInput,
  SupplierListFilters,
  SupplierProductListFilters,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from '@/features/suppliers/types'
import { supplierService } from '@/services/suppliers/supplierService'

function invalidateSupplierQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_PRODUCTS] })
}

export function useSuppliers(filters: SupplierListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, filters],
    queryFn: () => supplierService.getSuppliers(filters),
  })
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, 'detail', id],
    queryFn: () => supplierService.getSupplierById(id!),
    enabled: Boolean(id),
  })
}

export function useSupplierOptions() {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, 'options'],
    queryFn: () => supplierService.getSupplierOptions(),
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSupplierInput) => supplierService.createSupplier(input),
    onSuccess: () => {
      invalidateSupplierQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) =>
      supplierService.updateSupplier(id, input),
    onSuccess: (_data, variables) => {
      invalidateSupplierQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS, 'detail', variables.id] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => invalidateSupplierQueries(queryClient),
  })
}

export function useSupplierProducts(filters: SupplierProductListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_PRODUCTS, filters],
    queryFn: () => supplierService.getSupplierProducts(filters),
  })
}

export function useSupplierProduct(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_PRODUCTS, 'detail', id],
    queryFn: () => supplierService.getSupplierProductById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateSupplierProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSupplierProductInput) => supplierService.createSupplierProduct(input),
    onSuccess: () => invalidateSupplierQueries(queryClient),
  })
}

export function useUpdateSupplierProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierProductInput }) =>
      supplierService.updateSupplierProduct(id, input),
    onSuccess: (_data, variables) => {
      invalidateSupplierQueries(queryClient)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SUPPLIER_PRODUCTS, 'detail', variables.id],
      })
    },
  })
}

export function useDeleteSupplierProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplierProduct(id),
    onSuccess: () => invalidateSupplierQueries(queryClient),
  })
}
