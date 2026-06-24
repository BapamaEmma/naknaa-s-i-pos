import type {
  BackupSettings,
  BusinessSettings,
  CreateBranchInput,
  CreateTaxInput,
  CreateWarehouseInput,
  ManualBackupResult,
  NotificationSettings,
  ReceiptSettings,
  SecuritySettings,
  SecurityStatusSummary,
  SettingsAuditEntry,
  SettingsBranch,
  SettingsWarehouse,
  SystemSettings,
  TaxConfiguration,
  TaxSettings,
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
import { delay, readStorage, writeStorage } from '@/services/products/storage'
import {
  SEED_BACKUP_SETTINGS,
  SEED_BRANCHES,
  SEED_BUSINESS_SETTINGS,
  SEED_NOTIFICATION_SETTINGS,
  SEED_RECEIPT_SETTINGS,
  SEED_SECURITY_SETTINGS,
  SEED_SETTINGS_AUDIT,
  SEED_SETTINGS_WAREHOUSES,
  SEED_SYSTEM_SETTINGS,
  SEED_TAX_SETTINGS,
  SETTINGS_STORAGE_KEYS,
} from '@/services/settings/mock-data'

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function appendAudit(action: string, category: SettingsAuditEntry['category'] = 'settings'): void {
  const entries = readStorage(SETTINGS_STORAGE_KEYS.AUDIT, SEED_SETTINGS_AUDIT)
  const now = new Date()
  const entry: SettingsAuditEntry = {
    id: createId('audit'),
    user: 'System Admin',
    action,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    category,
  }
  writeStorage(SETTINGS_STORAGE_KEYS.AUDIT, [entry, ...entries].slice(0, 50))
}

export const settingsService = {
  async getBusinessSettings(): Promise<BusinessSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.BUSINESS, SEED_BUSINESS_SETTINGS)
  },

  async updateBusinessSettings(input: UpdateBusinessSettingsInput): Promise<BusinessSettings> {
    await delay()
    const updated: BusinessSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.BUSINESS, updated)
    appendAudit('Updated business information')
    return updated
  },

  async getReceiptSettings(): Promise<ReceiptSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.RECEIPTS, SEED_RECEIPT_SETTINGS)
  },

  async updateReceiptSettings(input: UpdateReceiptSettingsInput): Promise<ReceiptSettings> {
    await delay()
    const updated: ReceiptSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.RECEIPTS, updated)
    appendAudit('Updated receipt settings')
    return updated
  },

  async getBranches(): Promise<SettingsBranch[]> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.BRANCHES, SEED_BRANCHES)
  },

  async createBranch(input: CreateBranchInput): Promise<SettingsBranch> {
    await delay()
    const branches = readStorage(SETTINGS_STORAGE_KEYS.BRANCHES, SEED_BRANCHES)
    const branch: SettingsBranch = {
      id: createId('branch'),
      ...input,
      createdAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.BRANCHES, [...branches, branch])
    appendAudit(`Created branch: ${branch.branchName}`)
    return branch
  },

  async updateBranch(id: string, input: UpdateBranchInput): Promise<SettingsBranch> {
    await delay()
    const branches = readStorage(SETTINGS_STORAGE_KEYS.BRANCHES, SEED_BRANCHES)
    const index = branches.findIndex((entry) => entry.id === id)
    if (index === -1) {
      throw new Error('Branch not found')
    }
    const updated = { ...branches[index], ...input }
    branches[index] = updated
    writeStorage(SETTINGS_STORAGE_KEYS.BRANCHES, branches)
    appendAudit(`Updated branch: ${updated.branchName}`)
    return updated
  },

  async getWarehouses(): Promise<SettingsWarehouse[]> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.WAREHOUSES, SEED_SETTINGS_WAREHOUSES)
  },

  async createWarehouse(input: CreateWarehouseInput): Promise<SettingsWarehouse> {
    await delay()
    const warehouses = readStorage(SETTINGS_STORAGE_KEYS.WAREHOUSES, SEED_SETTINGS_WAREHOUSES)
    const warehouse: SettingsWarehouse = {
      id: createId('wh'),
      ...input,
      createdAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.WAREHOUSES, [...warehouses, warehouse])
    appendAudit(`Created warehouse: ${warehouse.warehouseName}`)
    return warehouse
  },

  async updateWarehouse(id: string, input: UpdateWarehouseInput): Promise<SettingsWarehouse> {
    await delay()
    const warehouses = readStorage(SETTINGS_STORAGE_KEYS.WAREHOUSES, SEED_SETTINGS_WAREHOUSES)
    const index = warehouses.findIndex((entry) => entry.id === id)
    if (index === -1) {
      throw new Error('Warehouse not found')
    }
    const updated = { ...warehouses[index], ...input }
    warehouses[index] = updated
    writeStorage(SETTINGS_STORAGE_KEYS.WAREHOUSES, warehouses)
    appendAudit(`Updated warehouse: ${updated.warehouseName}`)
    return updated
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.SECURITY, SEED_SECURITY_SETTINGS)
  },

  async getSecurityStatus(): Promise<SecurityStatusSummary> {
    await delay()
    const settings = readStorage(SETTINGS_STORAGE_KEYS.SECURITY, SEED_SECURITY_SETTINGS)
    const overallStatus =
      settings.twoFactorEnabled && settings.userLockoutEnabled
        ? 'secure'
        : settings.userLockoutEnabled
          ? 'moderate'
          : 'attention'

    return {
      passwordExpiryDays: settings.passwordExpiryDays,
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      loginAttemptLimit: settings.loginAttemptLimit,
      twoFactorEnabled: settings.twoFactorEnabled,
      userLockoutEnabled: settings.userLockoutEnabled,
      overallStatus,
      lastReviewedAt: settings.updatedAt,
    }
  },

  async updateSecuritySettings(input: UpdateSecuritySettingsInput): Promise<SecuritySettings> {
    await delay()
    const updated: SecuritySettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.SECURITY, updated)
    appendAudit('Updated security settings', 'security')
    return updated
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATION_SETTINGS)
  },

  async updateNotificationSettings(
    input: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> {
    await delay()
    const updated: NotificationSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.NOTIFICATIONS, updated)
    appendAudit('Updated notification settings')
    return updated
  },

  async getTaxSettings(): Promise<TaxSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.TAX, SEED_TAX_SETTINGS)
  },

  async createTax(input: CreateTaxInput): Promise<TaxConfiguration> {
    await delay()
    const settings = readStorage(SETTINGS_STORAGE_KEYS.TAX, SEED_TAX_SETTINGS)
    const tax: TaxConfiguration = {
      id: createId('tax'),
      ...input,
    }
    const updated: TaxSettings = {
      taxes: [...settings.taxes, tax],
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.TAX, updated)
    appendAudit(`Added tax: ${tax.taxName}`)
    return tax
  },

  async updateTax(id: string, input: UpdateTaxInput): Promise<TaxConfiguration> {
    await delay()
    const settings = readStorage(SETTINGS_STORAGE_KEYS.TAX, SEED_TAX_SETTINGS)
    const index = settings.taxes.findIndex((entry) => entry.id === id)
    if (index === -1) {
      throw new Error('Tax configuration not found')
    }
    const updatedTax = { ...settings.taxes[index], ...input }
    settings.taxes[index] = updatedTax
    settings.updatedAt = new Date().toISOString()
    writeStorage(SETTINGS_STORAGE_KEYS.TAX, settings)
    appendAudit(`Updated tax: ${updatedTax.taxName}`)
    return updatedTax
  },

  async deleteTax(id: string): Promise<void> {
    await delay()
    const settings = readStorage(SETTINGS_STORAGE_KEYS.TAX, SEED_TAX_SETTINGS)
    const tax = settings.taxes.find((entry) => entry.id === id)
    settings.taxes = settings.taxes.filter((entry) => entry.id !== id)
    settings.updatedAt = new Date().toISOString()
    writeStorage(SETTINGS_STORAGE_KEYS.TAX, settings)
    if (tax) {
      appendAudit(`Removed tax: ${tax.taxName}`)
    }
  },

  async getBackupSettings(): Promise<BackupSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.BACKUP, SEED_BACKUP_SETTINGS)
  },

  async updateBackupSettings(input: UpdateBackupSettingsInput): Promise<BackupSettings> {
    await delay()
    const current = readStorage(SETTINGS_STORAGE_KEYS.BACKUP, SEED_BACKUP_SETTINGS)
    const updated: BackupSettings = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.BACKUP, updated)
    appendAudit('Updated backup settings')
    return updated
  },

  async triggerManualBackup(): Promise<ManualBackupResult> {
    await delay(800)
    const current = readStorage(SETTINGS_STORAGE_KEYS.BACKUP, SEED_BACKUP_SETTINGS)
    const lastBackupDate = new Date().toISOString()
    const updated: BackupSettings = {
      ...current,
      lastBackupDate,
      backupStatus: 'success',
      updatedAt: lastBackupDate,
    }
    writeStorage(SETTINGS_STORAGE_KEYS.BACKUP, updated)
    appendAudit('Manual backup completed')
    return { lastBackupDate, backupStatus: 'success' }
  },

  async getSystemSettings(): Promise<SystemSettings> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.SYSTEM, SEED_SYSTEM_SETTINGS)
  },

  async updateSystemSettings(input: UpdateSystemSettingsInput): Promise<SystemSettings> {
    await delay()
    const updated: SystemSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(SETTINGS_STORAGE_KEYS.SYSTEM, updated)
    appendAudit('Updated system preferences')
    return updated
  },

  async getAuditLog(): Promise<SettingsAuditEntry[]> {
    await delay()
    return readStorage(SETTINGS_STORAGE_KEYS.AUDIT, SEED_SETTINGS_AUDIT)
  },
}
