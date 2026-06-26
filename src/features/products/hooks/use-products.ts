import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateProductInput,
  ProductListFilters,
  ProductListResult,
  UpdateProductInput,
} from '@/features/products/types'
import { categoryService } from '@/services/categories/categoryService'
import { productService } from '@/services/products/productService'

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, 'all'],
    queryFn: () => categoryService.getAllCategories(),
  })
}

export function useBrands() {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'brands'],
    queryFn: () => productService.getBrands(),
  })
}

export function useProducts(filters: ProductListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: () => productService.getProducts(filters),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, id],
    queryFn: () => productService.getProductById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => productService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productService.updateProduct(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, variables.id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (_data, deletedId) => {
      queryClient.setQueriesData<ProductListResult>(
        {
          queryKey: [QUERY_KEYS.PRODUCTS],
          predicate: (query) => Array.isArray((query.state.data as ProductListResult | undefined)?.data),
        },
        (current) => {
          if (!current?.data) return current

          const nextData = current.data.filter((product) => product.id !== deletedId)
          if (nextData.length === current.data.length) return current

          return {
            ...current,
            data: nextData,
            meta: {
              ...current.meta,
              total: Math.max(0, current.meta.total - 1),
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] })
    },
  })
}
