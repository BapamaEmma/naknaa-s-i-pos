import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type { CreateVariantInput, UpdateVariantInput } from '@/features/products/types'
import { variantService } from '@/services/products/variantService'

export function useVariants(productId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, productId],
    queryFn: () => variantService.getVariants(productId!),
    enabled: Boolean(productId),
  })
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateVariantInput) => variantService.createVariant(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
    },
  })
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ variantId, input }: { variantId: string; input: UpdateVariantInput }) =>
      variantService.updateVariant(productId, variantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
    },
  })
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variantId: string) => variantService.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, productId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
    },
  })
}
