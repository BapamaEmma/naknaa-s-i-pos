export type SettingsStatus = 'active' | 'inactive'

export type BackupSchedule = 'daily' | 'weekly' | 'monthly'

export type BackupStatus = 'success' | 'failed' | 'pending' | 'never'

export type ThemeMode = 'light' | 'dark' | 'system'

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

export type TimeFormat = '12h' | '24h'

export type ReceiptSize = '58mm' | '80mm'

export interface BusinessSettings {
  businessName: string
  businessLogo: string | null
  businessPhone: string
  alternatePhone: string
  emailAddress: string
  website: string
  businessAddress: string
  city: string
  country: string
  taxIdentificationNumber: string
  updatedAt: string
}

export type UpdateBusinessSettingsInput = Omit<BusinessSettings, 'updatedAt'>

export interface ReceiptSettings {
  receiptHeader: string
  receiptFooter: string
  showBusinessLogo: boolean
  showCustomerDetails: boolean
  showCashierName: boolean
  showBranchName: boolean
  receiptSize: ReceiptSize
  receiptNumberPrefix: string
  receiptNumberFormat: string
  updatedAt: string
}

export type UpdateReceiptSettingsInput = Omit<ReceiptSettings, 'updatedAt'>

export interface SettingsBranch {
  id: string
  branchName: string
  branchCode: string
  address: string
  phoneNumber: string
  manager: string
  status: SettingsStatus
  createdAt: string
}

export interface CreateBranchInput {
  branchName: string
  branchCode: string
  address: string
  phoneNumber: string
  manager: string
  status: SettingsStatus
}

export type UpdateBranchInput = Partial<CreateBranchInput>

export interface SettingsWarehouse {
  id: string
  warehouseName: string
  description: string
  address: string
  manager: string
  status: SettingsStatus
  createdAt: string
}

export interface CreateWarehouseInput {
  warehouseName: string
  description: string
  address: string
  manager: string
  status: SettingsStatus
}

export type UpdateWarehouseInput = Partial<CreateWarehouseInput>

export interface SecuritySettings {
  passwordExpiryDays: number
  sessionTimeoutMinutes: number
  loginAttemptLimit: number
  twoFactorEnabled: boolean
  userLockoutEnabled: boolean
  updatedAt: string
}

export type UpdateSecuritySettingsInput = Omit<SecuritySettings, 'updatedAt'>

export interface SecurityStatusSummary {
  passwordExpiryDays: number
  sessionTimeoutMinutes: number
  loginAttemptLimit: number
  twoFactorEnabled: boolean
  userLockoutEnabled: boolean
  overallStatus: 'secure' | 'moderate' | 'attention'
  lastReviewedAt: string
}

export interface NotificationSettings {
  lowStockAlerts: boolean
  newSaleNotifications: boolean
  warehouseTransferNotifications: boolean
  newUserNotifications: boolean
  systemAlerts: boolean
  inAppDelivery: boolean
  emailDelivery: boolean
  whatsAppDelivery: boolean
  updatedAt: string
}

export type UpdateNotificationSettingsInput = Omit<NotificationSettings, 'updatedAt'>

export interface TaxConfiguration {
  id: string
  taxName: string
  taxPercentage: number
  enabled: boolean
}

export interface TaxSettings {
  taxes: TaxConfiguration[]
  updatedAt: string
}

export interface CreateTaxInput {
  taxName: string
  taxPercentage: number
  enabled: boolean
}

export type UpdateTaxInput = Partial<CreateTaxInput>

export interface BackupSettings {
  automaticBackupEnabled: boolean
  backupSchedule: BackupSchedule
  lastBackupDate: string | null
  backupStatus: BackupStatus
  updatedAt: string
}

export type UpdateBackupSettingsInput = Omit<
  BackupSettings,
  'lastBackupDate' | 'backupStatus' | 'updatedAt'
>

export interface ManualBackupResult {
  lastBackupDate: string
  backupStatus: BackupStatus
}

export interface NumberingSettings {
  receiptPrefix: string
  receiptFormat: string
  customerPrefix: string
  customerFormat: string
  supplierPrefix: string
  supplierFormat: string
  productPrefix: string
  productFormat: string
  warehousePrefix: string
  warehouseFormat: string
}

export interface SystemSettings {
  currency: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
  themeMode: ThemeMode
  numbering: NumberingSettings
  updatedAt: string
}

export type UpdateSystemSettingsInput = Omit<SystemSettings, 'updatedAt'>

export interface SettingsAuditEntry {
  id: string
  user: string
  action: string
  date: string
  time: string
  category: 'settings' | 'user' | 'security'
}

export interface SettingsDashboardCard {
  id: string
  title: string
  description: string
  href: string
}
