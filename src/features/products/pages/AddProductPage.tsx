import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductForm } from '@/features/products/components/ProductForm'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useCategories, useCreateProduct } from '@/features/products/hooks/use-products'
import type { ProductFormOutput } from '@/features/products/schemas/product.schema'

export function AddProductPage() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useCategories()
  const createProduct = useCreateProduct()

  const handleSubmit = async (values: ProductFormOutput) => {
    const product = await createProduct.mutateAsync(values)
    navigate(PRODUCT_ROUTES.DETAIL(product.id))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Add Product"
        description="Create a new product in your inventory catalog."
        backTo={PRODUCT_ROUTES.LIST}
        backLabel="Back to products"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      ) : (
        <ProductForm
          categories={categories}
          isSubmitting={createProduct.isPending}
          submitLabel="Create product"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
