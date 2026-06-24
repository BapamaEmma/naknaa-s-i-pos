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
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet, apiPost, apiPut } from '@/services/api/http'
import {
  buildQueryParams,
  mapSettingsBranch,
  mapWarehouseDetail,
  toEntityStatus,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxes: [],
  updatedAt: new Date().toISOString(),
}

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  automaticBackupEnabled: false,
  backupSchedule: 'weekly',
  lastBackupDate: null,
  backupStatus: 'never',
  updatedAt: new Date().toISOString(),
}

function mapBusinessSettings(dto: Record<string, unknown>): BusinessSettings {
  return {
    businessName: String(dto.businessName ?? ''),
    businessLogo: dto.businessLogo ? String(dto.businessLogo) : null,
    businessPhone: String(dto.businessPhone ?? ''),
    alternatePhone: String(dto.alternatePhone ?? ''),
    emailAddress: String(dto.emailAddress ?? ''),
    website: String(dto.website ?? ''),
    businessAddress: String(dto.businessAddress ?? ''),
    city: String(dto.city ?? ''),
    country: String(dto.country ?? ''),
    taxIdentificationNumber: String(dto.taxIdentificationNumber ?? ''),
    updatedAt: String(dto.updatedAt ?? new Date().toISOString()),
  }
}

function mapReceiptSettings(dto: Record<string, unknown>): ReceiptSettings {
  return {
    receiptHeader: String(dto.receiptHeader ?? ''),
    receiptFooter: String(dto.receiptFooter ?? ''),
    showBusinessLogo: Boolean(dto.showBusinessLogo),
    showCustomerDetails: Boolean(dto.showCustomerDetails),
    showCashierName: Boolean(dto.showCashierName),
    showBranchName: Boolean(dto.showBranchName),
    receiptSize: (String(dto.receiptSize ?? '80mm') as ReceiptSettings['receiptSize']),
    receiptNumberPrefix: String(dto.receiptNumberPrefix ?? ''),
    receiptNumberFormat: String(dto.receiptNumberFormat ?? ''),
    updatedAt: String(dto.updatedAt ?? new Date().toISOString()),
  }
}

function mapSecuritySettings(dto: Record<string, unknown>): SecuritySettings {
  return {
    passwordExpiryDays: Number(dto.passwordExpiryDays ?? 90),
    sessionTimeoutMinutes: Number(dto.sessionTimeoutMinutes ?? 30),
    loginAttemptLimit: Number(dto.loginAttemptLimit ?? 5),
    twoFactorEnabled: Boolean(dto.twoFactorEnabled),
    userLockoutEnabled: Boolean(dto.userLockoutEnabled),
    updatedAt: String(dto.updatedAt ?? new Date().toISOString()),
  }
}

function mapNotificationSettings(dto: Record<string, unknown>): NotificationSettings {
  return {
    lowStockAlerts: Boolean(dto.lowStockAlerts),
    newSaleNotifications: Boolean(dto.newSaleNotifications),
    warehouseTransferNotifications: Boolean(dto.warehouseTransferNotifications),
    newUserNotifications: Boolean(dto.newUserNotifications),
    systemAlerts: Boolean(dto.systemAlerts),
    inAppDelivery: Boolean(dto.inAppDelivery),
    emailDelivery: Boolean(dto.emailDelivery),
    whatsAppDelivery: Boolean(dto.whatsAppDelivery),
    updatedAt: String(dto.updatedAt ?? new Date().toISOString()),
  }
}

function mapSystemSettings(dto: Record<string, unknown>): SystemSettings {
  const numbering = (dto.numbering ?? {}) as Record<string, unknown>
  return {
    currency: String(dto.currency ?? 'GHS'),
    dateFormat: (String(dto.dateFormat ?? 'DD/MM/YYYY') as SystemSettings['dateFormat']),
    timeFormat: (String(dto.timeFormat ?? '24h') as SystemSettings['timeFormat']),
    themeMode: (String(dto.themeMode ?? 'system') as SystemSettings['themeMode']),
    numbering: {
      receiptPrefix: String(numbering.receiptPrefix ?? ''),
      receiptFormat: String(numbering.receiptFormat ?? ''),
      customerPrefix: String(numbering.customerPrefix ?? ''),
      customerFormat: String(numbering.customerFormat ?? ''),
      supplierPrefix: String(numbering.supplierPrefix ?? ''),
      supplierFormat: String(numbering.supplierFormat ?? ''),
      productPrefix: String(numbering.productPrefix ?? ''),
      productFormat: String(numbering.productFormat ?? ''),
      warehousePrefix: String(numbering.warehousePrefix ?? ''),
      warehouseFormat: String(numbering.warehouseFormat ?? ''),
    },
    updatedAt: String(dto.updatedAt ?? new Date().toISOString()),
  }
}

function mapSettingsWarehouse(dto: Record<string, unknown>): SettingsWarehouse {
  return {
    id: String(dto.id),
    warehouseName: String(dto.warehouseName ?? ''),
    description: String(dto.description ?? ''),
    address: String(dto.address ?? ''),
    manager: String(dto.manager ?? ''),
    status: dto.status === 2 || dto.status === 'inactive' ? 'inactive' : 'active',
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
  }
}

function mapAuditEntry(dto: Record<string, unknown>): SettingsAuditEntry {
  const actionDate = String(dto.actionDate ?? dto.createdAt ?? new Date().toISOString())
  const date = new Date(actionDate)
  return {
    id: String(dto.id),
    user: String(dto.userName ?? dto.user ?? 'System'),
    action: String(dto.action ?? dto.details ?? ''),
    date: date.toISOString().slice(0, 10),
    time: date.toTimeString().slice(0, 5),
    category: 'settings',
  }
}

export const settingsService = {
  async getBusinessSettings(): Promise<BusinessSettings> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.settings.business)
    return mapBusinessSettings(dto)
  },

  async updateBusinessSettings(input: UpdateBusinessSettingsInput): Promise<BusinessSettings> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.business, input)
    return mapBusinessSettings(dto)
  },

  async getReceiptSettings(): Promise<ReceiptSettings> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.settings.receipts)
    return mapReceiptSettings(dto)
  },

  async updateReceiptSettings(input: UpdateReceiptSettingsInput): Promise<ReceiptSettings> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.receipts, input)
    return mapReceiptSettings(dto)
  },

  async getBranches(): Promise<SettingsBranch[]> {
    const branches = await apiGet<Array<Record<string, unknown>>>(API_ENDPOINTS.settings.branches)
    return branches.map((branch) => mapSettingsBranch(branch))
  },

  async createBranch(input: CreateBranchInput): Promise<SettingsBranch> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.settings.branches, {
      branchName: input.branchName,
      branchCode: input.branchCode,
      address: input.address,
      phoneNumber: input.phoneNumber,
      status: toEntityStatus(input.status),
    })
    return mapSettingsBranch(dto)
  },

  async updateBranch(id: string, input: UpdateBranchInput): Promise<SettingsBranch> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.branch(id), {
      branchName: input.branchName,
      branchCode: input.branchCode,
      address: input.address,
      phoneNumber: input.phoneNumber,
      status: input.status ? toEntityStatus(input.status) : undefined,
    })
    return mapSettingsBranch(dto)
  },

  async getWarehouses(): Promise<SettingsWarehouse[]> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.warehouses, {
      params: { page: 1, pageSize: 100 },
    })

    return result.items.map((item) => mapSettingsWarehouse(mapWarehouseDetail(item)))
  },

  async createWarehouse(input: CreateWarehouseInput): Promise<SettingsWarehouse> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.warehouses, {
      warehouseName: input.warehouseName,
      description: input.description,
      address: input.address,
      manager: input.manager,
      status: toEntityStatus(input.status),
    })
    return mapSettingsWarehouse(mapWarehouseDetail(dto))
  },

  async updateWarehouse(id: string, input: UpdateWarehouseInput): Promise<SettingsWarehouse> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.warehouse(id), {
      warehouseName: input.warehouseName,
      description: input.description,
      address: input.address,
      manager: input.manager,
      status: input.status ? toEntityStatus(input.status) : undefined,
    })
    return mapSettingsWarehouse(mapWarehouseDetail(dto))
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.settings.security)
    return mapSecuritySettings(dto)
  },

  async getSecurityStatus(): Promise<SecurityStatusSummary> {
    const settings = await this.getSecuritySettings()
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
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.security, input)
    return mapSecuritySettings(dto)
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.settings.notifications)
    return mapNotificationSettings(dto)
  },

  async updateNotificationSettings(
    input: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.notifications, input)
    return mapNotificationSettings(dto)
  },

  async getTaxSettings(): Promise<TaxSettings> {
    return DEFAULT_TAX_SETTINGS
  },

  async createTax(input: CreateTaxInput): Promise<TaxConfiguration> {
    const tax: TaxConfiguration = {
      id: crypto.randomUUID(),
      ...input,
    }
    return tax
  },

  async updateTax(id: string, input: UpdateTaxInput): Promise<TaxConfiguration> {
    const settings = await this.getTaxSettings()
    const existing = settings.taxes.find((entry) => entry.id === id)
    if (!existing) throw new Error('Tax configuration not found')
    return { ...existing, ...input }
  },

  async deleteTax(_id: string): Promise<void> {
    return
  },

  async getBackupSettings(): Promise<BackupSettings> {
    return DEFAULT_BACKUP_SETTINGS
  },

  async updateBackupSettings(input: UpdateBackupSettingsInput): Promise<BackupSettings> {
    return {
      ...DEFAULT_BACKUP_SETTINGS,
      ...input,
      updatedAt: new Date().toISOString(),
    }
  },

  async triggerManualBackup(): Promise<ManualBackupResult> {
    return {
      lastBackupDate: new Date().toISOString(),
      backupStatus: 'success',
    }
  },

  async getSystemSettings(): Promise<SystemSettings> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.settings.system)
    return mapSystemSettings(dto)
  },

  async updateSystemSettings(input: UpdateSystemSettingsInput): Promise<SystemSettings> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.settings.system, input)
    return mapSystemSettings(dto)
  },

  async getAuditLog(): Promise<SettingsAuditEntry[]> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.auditLogs, {
      params: buildQueryParams({ page: 1, pageSize: 50 }),
    })
    return result.items.map((entry) => mapAuditEntry(entry))
  },
}
