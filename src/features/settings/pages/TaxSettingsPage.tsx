import { TaxSettingsForm } from '@/features/settings/components/TaxSettingsForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useCreateTax,
  useDeleteTax,
  useTaxSettings,
  useUpdateTax,
} from '@/features/settings/hooks/use-settings'
import type { TaxFormOutput } from '@/features/settings/schemas/settings.schema'

export function TaxSettingsPage() {
  const { data, isLoading } = useTaxSettings()
  const createTax = useCreateTax()
  const updateTax = useUpdateTax()
  const deleteTax = useDeleteTax()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Tax Settings"
        description="Configure VAT, NHIL, GETFund, and other tax rates."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <TaxSettingsForm
        settings={data}
        isLoading={isLoading}
        isSubmitting={createTax.isPending || updateTax.isPending || deleteTax.isPending}
        onCreate={async (values: TaxFormOutput) => {
          await createTax.mutateAsync(values)
        }}
        onUpdate={async (id, values) => {
          await updateTax.mutateAsync({ id, input: values })
        }}
        onDelete={async (id) => {
          await deleteTax.mutateAsync(id)
        }}
      />
    </div>
  )
}
