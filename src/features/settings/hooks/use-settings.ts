import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateBranchInput,
  CreateTaxInput,
  CreateWarehouseInput,
  UpdateBackupSettingsInput,
  UpdateBranchInput,
  UpdateBusinessSettingsInput,
  UpdateNotificationSettingsInput,
  UpdateReceiptSettingsInput,
  UpdateSecuritySettingsInput,
  UpdateSystemSettingsInput,
  UpdateTaxInput,
  UpdateWarehouseInput,
} from '@/features/settings/types'
import { settingsService } from '@/services/settings/settingsService'

function invalidateSettings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] })
}

export function useBusinessSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'business'],
    queryFn: () => settingsService.getBusinessSettings(),
  })
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBusinessSettingsInput) =>
      settingsService.updateBusinessSettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useReceiptSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'receipts'],
    queryFn: () => settingsService.getReceiptSettings(),
  })
}

export function useUpdateReceiptSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateReceiptSettingsInput) =>
      settingsService.updateReceiptSettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useBranches() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'branches'],
    queryFn: () => settingsService.getBranches(),
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBranchInput) => settingsService.createBranch(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) =>
      settingsService.updateBranch(id, input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useWarehouses() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'warehouses'],
    queryFn: () => settingsService.getWarehouses(),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseInput) => settingsService.createWarehouse(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWarehouseInput }) =>
      settingsService.updateWarehouse(id, input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'security'],
    queryFn: () => settingsService.getSecuritySettings(),
  })
}

export function useSecurityStatus() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'security-status'],
    queryFn: () => settingsService.getSecurityStatus(),
  })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSecuritySettingsInput) =>
      settingsService.updateSecuritySettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'notifications'],
    queryFn: () => settingsService.getNotificationSettings(),
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNotificationSettingsInput) =>
      settingsService.updateNotificationSettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useTaxSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'tax'],
    queryFn: () => settingsService.getTaxSettings(),
  })
}

export function useCreateTax() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaxInput) => settingsService.createTax(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useUpdateTax() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaxInput }) =>
      settingsService.updateTax(id, input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useDeleteTax() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteTax(id),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useBackupSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'backups'],
    queryFn: () => settingsService.getBackupSettings(),
  })
}

export function useUpdateBackupSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBackupSettingsInput) =>
      settingsService.updateBackupSettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useManualBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => settingsService.triggerManualBackup(),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useSystemSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'system'],
    queryFn: () => settingsService.getSystemSettings(),
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSystemSettingsInput) =>
      settingsService.updateSystemSettings(input),
    onSuccess: () => invalidateSettings(queryClient),
  })
}

export function useSettingsAuditLog() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS, 'audit'],
    queryFn: () => settingsService.getAuditLog(),
  })
}
