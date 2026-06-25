import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import { PageHeader } from '@/features/categories/components/PageHeader'
import { CATEGORY_ROUTES } from '@/features/categories/constants'
import { useCategory, useUpdateCategory } from '@/features/categories/hooks/use-categories'
import type { CategoryFormOutput } from '@/features/categories/schemas/category.schema'

export function EditCategoryPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: category, isLoading, isError } = useCategory(id)
  const updateCategory = useUpdateCategory()

  const handleSubmit = async (values: CategoryFormOutput) => {
    await updateCategory.mutateAsync({ id, input: values })
    navigate(CATEGORY_ROUTES.DETAIL(id))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" layout="form" />
      </div>
    )
  }

  if (isError || !category) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Category not found.</p>
        <Button asChild variant="outline">
          <Link to={CATEGORY_ROUTES.LIST}>Back to categories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Edit Category"
        description={`Update details for ${category.name}.`}
        backTo={CATEGORY_ROUTES.DETAIL(id)}
        backLabel="Back to category"
      />

      <CategoryForm
        category={category}
        isSubmitting={updateCategory.isPending}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
