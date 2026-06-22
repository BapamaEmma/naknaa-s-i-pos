import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  CategoryDetailsCard,
  CategoryProductsList,
} from '@/features/categories/components/CategoryDetailsCard'
import { CategoryStatsCards } from '@/features/categories/components/CategoryStatsCards'
import { PageHeader } from '@/features/categories/components/PageHeader'
import { CATEGORY_ROUTES } from '@/features/categories/constants'
import { useCategory } from '@/features/categories/hooks/use-categories'

export function CategoryDetailsPage() {
  const { id = '' } = useParams()
  const { data: category, isLoading, isError } = useCategory(id)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
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
        title={category.name}
        description="Category details, statistics, and assigned products."
        backTo={CATEGORY_ROUTES.LIST}
        backLabel="Back to categories"
        action={
          <Button asChild>
            <Link to={CATEGORY_ROUTES.EDIT(id)}>
              <Pencil className="h-4 w-4" />
              Edit Category
            </Link>
          </Button>
        }
      />

      <CategoryDetailsCard category={category} />
      <CategoryStatsCards statistics={category.statistics} />
      <CategoryProductsList categoryName={category.name} products={category.products} />
    </div>
  )
}
