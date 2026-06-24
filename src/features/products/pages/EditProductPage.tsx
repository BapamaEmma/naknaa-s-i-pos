import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductForm } from '@/features/products/components/ProductForm'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useCategories, useProduct, useUpdateProduct } from '@/features/products/hooks/use-products'
import type { ProductWithPricingFormOutput } from '@/features/products/schemas/product.schema'
import { getPrimaryVariant } from '@/features/products/utils/pricing'
import { variantService } from '@/services/products/variantService'

export function EditProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()
  const { data: product, isLoading, isError } = useProduct(id)
  const updateProduct = useUpdateProduct()

  const handleSubmit = async (values: ProductWithPricingFormOutput) => {
    if (!product) return

    const { sellingPrice, initialStock, ...productInput } = values

    await updateProduct.mutateAsync({
      id,
      input: { ...productInput, sku: product.sku, sellingPrice },
    })

    const primaryVariant = getPrimaryVariant(product.variants)
    if (primaryVariant) {
      await variantService.updateVariant(id, primaryVariant.id, {
        name: 'Standard',
        variantType: 'Default',
        costPrice: primaryVariant.costPrice,
        sellingPrice,
        currentStock: initialStock,
        minimumStock: primaryVariant.minimumStock,
      })
    } else {
      await variantService.createVariant(id, {
        name: 'Standard',
        variantType: 'Default',
        costPrice: 0,
        sellingPrice,
        currentStock: initialStock,
        minimumStock: 0,
        isActive: true,
      })
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, id] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_VARIANTS, id] })
    navigate(PRODUCT_ROUTES.DETAIL(id))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Product not found.</p>
        <Button asChild variant="outline">
          <Link to={PRODUCT_ROUTES.LIST}>Back to products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Edit Product"
        description={`Update details for ${product.name}.`}
        backTo={PRODUCT_ROUTES.DETAIL(id)}
        backLabel="Back to product"
      />

      <ProductForm
        categories={categories}
        product={product}
        requirePricing
        isSubmitting={updateProduct.isPending}
        submitLabel="Save changes"
        onSubmit={(values) => handleSubmit(values as ProductWithPricingFormOutput)}
      />
    </div>
  )
}
