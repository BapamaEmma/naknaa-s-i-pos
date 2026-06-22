export { ProductListPage } from './pages/ProductListPage'
export { AddProductPage } from './pages/AddProductPage'
export { EditProductPage } from './pages/EditProductPage'
export { ProductDetailsPage } from './pages/ProductDetailsPage'
export { ManageVariantsPage } from './pages/ManageVariantsPage'

export {
  useCategories,
  useBrands,
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './hooks/use-products'
export {
  useVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from './hooks/use-variants'

export { ProductTable } from './components/ProductTable'
export { ProductGrid } from './components/ProductGrid'
export { ProductDetailsDialog } from './components/ProductDetailsDialog'
export { ProductForm } from './components/ProductForm'
export { ProductFilters } from './components/ProductFilters'
export { VariantTable } from './components/VariantTable'
export { VariantForm } from './components/VariantForm'

export { PRODUCT_ROUTES } from './constants'
export type {
  Product,
  ProductVariant,
  Category,
  ProductDetail,
  ProductListFilters,
  ProductListItem,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from './types'
