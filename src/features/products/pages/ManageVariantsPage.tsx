import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/products/components/PageHeader'
import { VariantDeleteDialog } from '@/features/products/components/VariantDeleteDialog'
import { VariantForm } from '@/features/products/components/VariantForm'
import { VariantTable } from '@/features/products/components/VariantTable'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useProduct } from '@/features/products/hooks/use-products'
import {
  useCreateVariant,
  useUpdateVariant,
  useVariants,
} from '@/features/products/hooks/use-variants'
import type { VariantFormOutput } from '@/features/products/schemas/product.schema'
import type { ProductVariant } from '@/features/products/types'

export function ManageVariantsPage() {
  const { id = '' } = useParams()
  const { data: product, isLoading: productLoading, isError } = useProduct(id)
  const { data: variants = [], isLoading: variantsLoading } = useVariants(id)
  const createVariant = useCreateVariant(id)
  const updateVariant = useUpdateVariant(id)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const handleVariantSubmit = async (values: VariantFormOutput) => {
    const payload = {
      ...values,
      currentStock: selectedVariant?.currentStock ?? 0,
    }

    if (selectedVariant) {
      await updateVariant.mutateAsync({ variantId: selectedVariant.id, input: payload })
    } else {
      await createVariant.mutateAsync(payload)
    }

    setFormOpen(false)
    setSelectedVariant(null)
  }

  if (productLoading) {
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
        title="Manage Variants"
        description={`Configure variants for ${product.name}.`}
        backTo={PRODUCT_ROUTES.DETAIL(id)}
        backLabel="Back to product"
        action={
          <Button
            onClick={() => {
              setSelectedVariant(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>
        }
      />

      <VariantTable
        variants={variants}
        isLoading={variantsLoading}
        onEdit={(variant) => {
          setSelectedVariant(variant)
          setFormOpen(true)
        }}
        onDelete={(variant) => {
          setSelectedVariant(variant)
          setDeleteOpen(true)
        }}
      />

      <VariantForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setSelectedVariant(null)
        }}
        variant={selectedVariant}
        isSubmitting={createVariant.isPending || updateVariant.isPending}
        showCurrentStock={false}
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
