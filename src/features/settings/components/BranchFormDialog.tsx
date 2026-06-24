import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  branchFormSchema,
  type BranchFormInput,
  type BranchFormOutput,
} from '@/features/settings/schemas/settings.schema'
import { SETTINGS_STATUS_LABELS } from '@/features/settings/constants'
import type { SettingsBranch } from '@/features/settings/types'

interface BranchFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: SettingsBranch | null
  isSubmitting?: boolean
  onSubmit: (values: BranchFormOutput) => Promise<void>
}

const defaultValues: BranchFormInput = {
  branchName: '',
  branchCode: '',
  address: '',
  phoneNumber: '',
  manager: '',
  status: 'active',
}

export function BranchFormDialog({
  open,
  onOpenChange,
  branch,
  isSubmitting,
  onSubmit,
}: BranchFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormInput, unknown, BranchFormOutput>({
    resolver: zodResolver(branchFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      return
    }
    if (branch) {
      reset({
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        address: branch.address,
        phoneNumber: branch.phoneNumber,
        manager: branch.manager,
        status: branch.status,
      })
      return
    }
    reset(defaultValues)
  }, [open, branch, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{branch ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
            <DialogDescription>
              {branch ? 'Update branch details and status.' : 'Add a new store branch.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input id="branchName" {...register('branchName')} />
              {errors.branchName ? (
                <p className="text-sm text-destructive">{errors.branchName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code *</Label>
              <Input id="branchCode" {...register('branchCode')} />
              {errors.branchCode ? (
                <p className="text-sm text-destructive">{errors.branchCode.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register('address')} />
              {errors.address ? (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input id="phoneNumber" {...register('phoneNumber')} />
              {errors.phoneNumber ? (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager *</Label>
              <Input id="manager" {...register('manager')} />
              {errors.manager ? (
                <p className="text-sm text-destructive">{errors.manager.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register('status')}>
                {Object.entries(SETTINGS_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : branch ? 'Update Branch' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
