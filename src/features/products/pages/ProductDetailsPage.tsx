import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layers3, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InventorySummaryCards } from '@/features/products/components/InventorySummaryCards'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductInfoCard } from '@/features/products/components/ProductInfoCard'
import { VariantDeleteDialog } from '@/features/products/components/VariantDeleteDialog'
import { VariantForm } from '@/features/products/components/VariantForm'
import { VariantTable } from '@/features/products/components/VariantTable'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useProduct } from '@/features/products/hooks/use-products'
import {
  useCreateVariant,
  useUpdateVariant,
} from '@/features/products/hooks/use-variants'
import type { VariantFormOutput } from '@/features/products/schemas/product.schema'
import type { ProductVariant } from '@/features/products/types'

export function ProductDetailsPage() {
  const { id = '' } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)
  const createVariant = useCreateVariant(id)
  const updateVariant = useUpdateVariant(id)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const handleVariantSubmit = async (values: VariantFormOutput) => {
    if (selectedVariant) {
      await updateVariant.mutateAsync({ variantId: selectedVariant.id, input: values })
    } else {
      await createVariant.mutateAsync(values)
    }
    setFormOpen(false)
    setSelectedVariant(null)
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
        title={product.name}
        description="View product information, inventory summary, and variants."
        backTo={PRODUCT_ROUTES.LIST}
        backLabel="Back to products"
        action={
          <>
            <Button variant="outline" asChild>
              <Link to={PRODUCT_ROUTES.VARIANTS(id)}>
                <Layers3 className="h-4 w-4" />
                Manage Variants
              </Link>
            </Button>
            <Button asChild>
              <Link to={PRODUCT_ROUTES.EDIT(id)}>
                <Pencil className="h-4 w-4" />
                Edit Product
              </Link>
            </Button>
          </>
        }
      />

      <ProductInfoCard product={product} />
      <InventorySummaryCards summary={product.inventorySummary} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Variants</h2>
            <p className="text-sm text-muted-foreground">
              Track pricing and stock levels for each product variant.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedVariant(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>
        </div>

        <VariantTable
          variants={product.variants}
          onEdit={(variant) => {
            setSelectedVariant(variant)
            setFormOpen(true)
          }}
          onDelete={(variant) => {
            setSelectedVariant(variant)
            setDeleteOpen(true)
          }}
        />
      </div>

      <VariantForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setSelectedVariant(null)
        }}
        variant={selectedVariant}
        isSubmitting={createVariant.isPending || updateVariant.isPending}
        showCurrentStock
        onSubmit={handleVariantSubmit}
      />

      <VariantDeleteDialog
        productId={id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant={selectedVariant}
      />
    </div>
  )
}
