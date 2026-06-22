import { useNavigate } from 'react-router-dom'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import { PageHeader } from '@/features/categories/components/PageHeader'
import { CATEGORY_ROUTES } from '@/features/categories/constants'
import { useCreateCategory } from '@/features/categories/hooks/use-categories'
import type { CategoryFormOutput } from '@/features/categories/schemas/category.schema'

export function CreateCategoryPage() {
  const navigate = useNavigate()
  const createCategory = useCreateCategory()

  const handleSubmit = async (values: CategoryFormOutput) => {
    await createCategory.mutateAsync(values)
    navigate(CATEGORY_ROUTES.LIST)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Category"
        description="Add a new category to organize your product catalog."
        backTo={CATEGORY_ROUTES.LIST}
        backLabel="Back to categories"
      />

      <CategoryForm
        isSubmitting={createCategory.isPending}
        submitLabel="Create category"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
