import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BranchFormDialog } from '@/features/settings/components/BranchFormDialog'
import { BranchSettingsTable } from '@/features/settings/components/BranchSettingsTable'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
} from '@/features/settings/hooks/use-settings'
import type { BranchFormOutput } from '@/features/settings/schemas/settings.schema'
import type { SettingsBranch } from '@/features/settings/types'

export function BranchSettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<SettingsBranch | null>(null)

  const { data: branches = [], isLoading } = useBranches()
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()

  const handleSubmit = async (values: BranchFormOutput) => {
    if (editingBranch) {
      await updateBranch.mutateAsync({ id: editingBranch.id, input: values })
    } else {
      await createBranch.mutateAsync(values)
    }
  }

  const handleToggleStatus = async (branch: SettingsBranch) => {
    await updateBranch.mutateAsync({
      id: branch.id,
      input: { status: branch.status === 'active' ? 'inactive' : 'active' },
    })
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Branch Settings"
        description="Create and manage store branches across Ghana."
        backTo={SETTINGS_ROUTES.ROOT}
        action={
          <Button
            onClick={() => {
              setEditingBranch(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Create Branch
          </Button>
        }
      />

      <BranchSettingsTable
        branches={branches}
        isLoading={isLoading}
        onEdit={(branch) => {
          setEditingBranch(branch)
          setDialogOpen(true)
        }}
        onToggleStatus={handleToggleStatus}
      />

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={editingBranch}
        isSubmitting={createBranch.isPending || updateBranch.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
