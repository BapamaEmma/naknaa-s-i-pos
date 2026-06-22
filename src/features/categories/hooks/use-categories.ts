import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CategoryListFilters,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/types'
import { categoryService } from '@/services/categories/categoryService'

export function useCategories(filters: CategoryListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, filters],
    queryFn: () => categoryService.getCategories(filters),
  })
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, id],
    queryFn: () => categoryService.getCategoryById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoryService.updateCategory(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES, variables.id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
    },
  })
}
