import type {
  BackupSettings,
  BusinessSettings,
  NotificationSettings,
  ReceiptSettings,
  SecuritySettings,
  SettingsAuditEntry,
  SettingsBranch,
  SettingsWarehouse,
  SystemSettings,
  TaxConfiguration,
  TaxSettings,
} from '@/features/settings/types'
import { DEFAULT_BUSINESS_NAME } from '@/features/settings/constants'

export const SETTINGS_STORAGE_KEYS = {
  BUSINESS: 'naknaa_settings_business_v1',
  RECEIPTS: 'naknaa_settings_receipts_v1',
  BRANCHES: 'naknaa_settings_branches_v1',
  WAREHOUSES: 'naknaa_settings_warehouses_v1',
  SECURITY: 'naknaa_settings_security_v1',
  NOTIFICATIONS: 'naknaa_settings_notifications_v1',
  TAX: 'naknaa_settings_tax_v1',
  BACKUP: 'naknaa_settings_backup_v1',
  SYSTEM: 'naknaa_settings_system_v1',
  AUDIT: 'naknaa_settings_audit_v1',
} as const

const now = new Date().toISOString()

export const SEED_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: DEFAULT_BUSINESS_NAME,
  businessLogo: null,
  businessPhone: '+233 30 123 4567',
  alternatePhone: '+233 24 987 6543',
  emailAddress: 'info@naknaa.com',
  website: 'https://naknaa.com',
  businessAddress: 'Ring Road Central, Accra',
  city: 'Accra',
  country: 'Ghana',
  taxIdentificationNumber: 'C0001234567',
  updatedAt: now,
}

export const SEED_RECEIPT_SETTINGS: ReceiptSettings = {
  receiptHeader: DEFAULT_BUSINESS_NAME,
  receiptFooter: 'Thank You For Shopping With Us!',
  showBusinessLogo: true,
  showCustomerDetails: true,
  showCashierName: true,
  showBranchName: true,
  receiptSize: '80mm',
  receiptNumberPrefix: 'NAK',
  receiptNumberFormat: 'NAK-{year}-{sequence}',
  updatedAt: now,
}

export const SEED_BRANCHES: SettingsBranch[] = [
  {
    id: 'branch-accra',
    branchName: 'Accra Branch',
    branchCode: 'ACC',
    address: 'Ring Road Central, Accra',
    phoneNumber: '+233 30 123 4567',
    manager: 'Kwame Mensah',
    status: 'active',
    createdAt: now,
  },
  {
    id: 'branch-kumasi',
    branchName: 'Kumasi Branch',
    branchCode: 'KUM',
    address: 'Adum, Kumasi',
    phoneNumber: '+233 32 456 7890',
    manager: 'Ama Osei',
    status: 'active',
    createdAt: now,
  },
  {
    id: 'branch-tamale',
    branchName: 'Tamale Branch',
    branchCode: 'TAM',
    address: 'Central Market, Tamale',
    phoneNumber: '+233 37 789 0123',
    manager: 'Ibrahim Yakubu',
    status: 'inactive',
    createdAt: now,
  },
]

export const SEED_SETTINGS_WAREHOUSES: SettingsWarehouse[] = [
  {
    id: 'wh-chairman-down',
    warehouseName: 'Chairman Down',
    description: 'Ground floor storage for fast-moving electronics',
    address: 'Chairman Building, Ground Floor',
    manager: 'Samuel Adjei',
    status: 'active',
    createdAt: now,
  },
  {
    id: 'wh-chairman-top',
    warehouseName: 'Chairman Top',
    description: 'Upper floor bulk inventory storage',
    address: 'Chairman Building, Top Floor',
    manager: 'Grace Boateng',
    status: 'active',
    createdAt: now,
  },
  {
    id: 'wh-nasoo',
    warehouseName: 'Nasoo',
    description: 'Nasoo warehouse for audio equipment',
    address: 'Nasoo Industrial Area',
    manager: 'Kofi Annan',
    status: 'active',
    createdAt: now,
  },
  {
    id: 'wh-masalachi',
    warehouseName: 'Masalachi',
    description: 'Masalachi overflow storage facility',
    address: 'Masalachi Road',
    manager: 'Abena Frimpong',
    status: 'active',
    createdAt: now,
  },
]

export const SEED_SECURITY_SETTINGS: SecuritySettings = {
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  loginAttemptLimit: 5,
  twoFactorEnabled: false,
  userLockoutEnabled: true,
  updatedAt: now,
}

export const SEED_NOTIFICATION_SETTINGS: NotificationSettings = {
  lowStockAlerts: true,
  newSaleNotifications: true,
  warehouseTransferNotifications: true,
  newUserNotifications: true,
  systemAlerts: true,
  inAppDelivery: true,
  emailDelivery: false,
  whatsAppDelivery: false,
  updatedAt: now,
}

export const SEED_TAXES: TaxConfiguration[] = [
  { id: 'tax-vat', taxName: 'VAT', taxPercentage: 15, enabled: true },
  { id: 'tax-nhil', taxName: 'NHIL', taxPercentage: 2.5, enabled: true },
  { id: 'tax-getfund', taxName: 'GETFund', taxPercentage: 2.5, enabled: false },
]

export const SEED_TAX_SETTINGS: TaxSettings = {
  taxes: SEED_TAXES,
  updatedAt: now,
}

export const SEED_BACKUP_SETTINGS: BackupSettings = {
  automaticBackupEnabled: true,
  backupSchedule: 'daily',
  lastBackupDate: new Date(Date.now() - 86_400_000).toISOString(),
  backupStatus: 'success',
  updatedAt: now,
}

export const SEED_SYSTEM_SETTINGS: SystemSettings = {
  currency: 'GHS',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  themeMode: 'system',
  numbering: {
    receiptPrefix: 'NAK',
    receiptFormat: 'NAK-{year}-{sequence}',
    customerPrefix: 'CUS',
    customerFormat: 'CUS-{sequence}',
    supplierPrefix: 'SUP',
    supplierFormat: 'SUP-{sequence}',
    productPrefix: 'PRD',
    productFormat: 'PRD-{sequence}',
    warehousePrefix: 'WH',
    warehouseFormat: 'WH-{sequence}',
  },
  updatedAt: now,
}

export const SEED_SETTINGS_AUDIT: SettingsAuditEntry[] = [
  {
    id: 'audit-1',
    user: 'System Admin',
    action: 'Updated business information',
    date: '2026-06-20',
    time: '09:15',
    category: 'settings',
  },
  {
    id: 'audit-2',
    user: 'System Admin',
    action: 'Changed receipt footer message',
    date: '2026-06-19',
    time: '14:42',
    category: 'settings',
  },
  {
    id: 'audit-3',
    user: 'System Admin',
    action: 'Created Kumasi Branch',
    date: '2026-06-18',
    time: '11:30',
    category: 'settings',
  },
  {
    id: 'audit-4',
    user: 'System Admin',
    action: 'Enabled user lockout policy',
    date: '2026-06-17',
    time: '16:05',
    category: 'security',
  },
  {
    id: 'audit-5',
    user: 'System Admin',
    action: 'Added new cashier account',
    date: '2026-06-16',
    time: '10:20',
    category: 'user',
  },
  {
    id: 'audit-6',
    user: 'System Admin',
    action: 'Updated VAT tax rate to 15%',
    date: '2026-06-15',
    time: '08:55',
    category: 'settings',
  },
]
