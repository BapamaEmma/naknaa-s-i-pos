import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductForm } from '@/features/products/components/ProductForm'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useCategories, useCreateProduct } from '@/features/products/hooks/use-products'
import type { ProductWithPricingFormOutput } from '@/features/products/schemas/product.schema'
import { variantService } from '@/services/products/variantService'

export function AddProductPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading } = useCategories()
  const createProduct = useCreateProduct()

  const handleSubmit = async (values: ProductWithPricingFormOutput) => {
    const { sellingPrice, initialStock, ...productInput } = values
    const product = await createProduct.mutateAsync({
      ...productInput,
      sku: '',
      sellingPrice,
    })

    await variantService.createVariant(product.id, {
      name: 'Standard',
      variantType: 'Default',
      costPrice: 0,
      sellingPrice,
      currentStock: initialStock,
      minimumStock: 0,
      isActive: true,
    })

    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, product.id] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, product.id] })
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
          requirePricing
          isSubmitting={createProduct.isPending}
          submitLabel="Create product"
          onSubmit={(values) => handleSubmit(values as ProductWithPricingFormOutput)}
        />
      )}
    </div>
  )
}
