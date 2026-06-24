import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceCategoryForm } from '@/features/services/components/ServiceCategoryForm'
import { ServiceCategoryTable } from '@/features/services/components/ServiceCategoryTable'
import { SERVICE_ROUTES } from '@/features/services/constants'
import {
  useCreateServiceCategory,
  useDeleteServiceCategory,
  useServiceCategories,
  useUpdateServiceCategory,
} from '@/features/services/hooks/use-services'
import type { ServiceCategory } from '@/features/services/types'
import type { ServiceCategoryFormOutput } from '@/features/services/schemas/service.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function ServiceCategoriesPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)

  const { data: categories = [], isLoading } = useServiceCategories()
  const createCategory = useCreateServiceCategory()
  const updateCategory = useUpdateServiceCategory()
  const deleteCategory = useDeleteServiceCategory()

  const openCreateDialog = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEditDialog = (category: ServiceCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: ServiceCategoryFormOutput) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, input: values })
    } else {
      await createCategory.mutateAsync(values)
    }
    setDialogOpen(false)
    setEditingCategory(null)
  }

  const handleDelete = async (category: ServiceCategory) => {
    try {
      await deleteCategory.mutateAsync(category.id)
    } catch {
      // surfaced via mutation if needed
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Service Categories"
        description="Organize services into categories for reporting and job assignment."
        backTo={SERVICE_ROUTES.LIST}
        backLabel="Back to services"
        action={
          canManage ? (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          ) : null
        }
      />

      <ServiceCategoryTable
        categories={categories}
        isLoading={isLoading}
        canManage={canManage}
        onEdit={openEditDialog}
        onDelete={handleDelete}
      />

      {canManage ? (
        <ServiceCategoryForm
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingCategory(null)
          }}
          category={editingCategory}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}
