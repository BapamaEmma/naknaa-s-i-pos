export { CategoryListPage } from './pages/CategoryListPage'
export { CreateCategoryPage } from './pages/CreateCategoryPage'
export { EditCategoryPage } from './pages/EditCategoryPage'
export { CategoryDetailsPage } from './pages/CategoryDetailsPage'

export {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks/use-categories'

export { CategoryTable } from './components/CategoryTable'
export { CategoryForm } from './components/CategoryForm'
export { CategoryFilters } from './components/CategoryFilters'
export { CategoryStatsCards } from './components/CategoryStatsCards'
export { CategoryDetailsCard, CategoryProductsList } from './components/CategoryDetailsCard'

export { CATEGORY_ROUTES, CATEGORY_API_ENDPOINTS } from './constants'

export type {
  Category,
  CategoryDetail,
  CategoryListFilters,
  CategoryListItem,
  CategoryStatistics,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types'
