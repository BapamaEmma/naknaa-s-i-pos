import { z } from 'zod'

export const businessSettingsSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required'),
  businessLogo: z.string().nullable(),
  businessPhone: z.string().trim().min(1, 'Phone number is required'),
  alternatePhone: z.string().trim(),
  emailAddress: z.string().trim().email('Enter a valid email address'),
  website: z.string().trim(),
  businessAddress: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  country: z.string().trim().min(1, 'Country is required'),
  taxIdentificationNumber: z.string().trim(),
})

export const receiptSettingsSchema = z.object({
  receiptHeader: z.string().trim().min(1, 'Receipt header is required'),
  receiptFooter: z.string().trim(),
  showBusinessLogo: z.boolean(),
  showCustomerDetails: z.boolean(),
  showCashierName: z.boolean(),
  showBranchName: z.boolean(),
  receiptSize: z.enum(['58mm', '80mm']),
  receiptNumberPrefix: z.string().trim().min(1, 'Prefix is required'),
  receiptNumberFormat: z.string().trim().min(1, 'Format is required'),
})

export const branchFormSchema = z.object({
  branchName: z.string().trim().min(1, 'Branch name is required'),
  branchCode: z.string().trim().min(1, 'Branch code is required'),
  address: z.string().trim().min(1, 'Address is required'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  manager: z.string().trim().min(1, 'Manager is required'),
  status: z.enum(['active', 'inactive']),
})

export const warehouseFormSchema = z.object({
  warehouseName: z.string().trim().min(1, 'Warehouse name is required'),
  description: z.string().trim(),
  address: z.string().trim().min(1, 'Address is required'),
  manager: z.string().trim().min(1, 'Manager is required'),
  status: z.enum(['active', 'inactive']),
})

export const securitySettingsSchema = z.object({
  passwordExpiryDays: z.coerce.number().min(30, 'Minimum 30 days').max(365),
  sessionTimeoutMinutes: z.coerce.number().min(5, 'Minimum 5 minutes').max(480),
  loginAttemptLimit: z.coerce.number().min(3, 'Minimum 3 attempts').max(10),
  twoFactorEnabled: z.boolean(),
  userLockoutEnabled: z.boolean(),
})

export const notificationSettingsSchema = z.object({
  lowStockAlerts: z.boolean(),
  newSaleNotifications: z.boolean(),
  warehouseTransferNotifications: z.boolean(),
  newUserNotifications: z.boolean(),
  systemAlerts: z.boolean(),
  inAppDelivery: z.boolean(),
  emailDelivery: z.boolean(),
  whatsAppDelivery: z.boolean(),
})

export const taxFormSchema = z.object({
  taxName: z.string().trim().min(1, 'Tax name is required'),
  taxPercentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100),
  enabled: z.boolean(),
})

export const backupSettingsSchema = z.object({
  automaticBackupEnabled: z.boolean(),
  backupSchedule: z.enum(['daily', 'weekly', 'monthly']),
})

export const numberingSettingsSchema = z.object({
  receiptPrefix: z.string().trim().min(1, 'Prefix is required'),
  receiptFormat: z.string().trim().min(1, 'Format is required'),
  customerPrefix: z.string().trim().min(1, 'Prefix is required'),
  customerFormat: z.string().trim().min(1, 'Format is required'),
  supplierPrefix: z.string().trim().min(1, 'Prefix is required'),
  supplierFormat: z.string().trim().min(1, 'Format is required'),
  productPrefix: z.string().trim().min(1, 'Prefix is required'),
  productFormat: z.string().trim().min(1, 'Format is required'),
  warehousePrefix: z.string().trim().min(1, 'Prefix is required'),
  warehouseFormat: z.string().trim().min(1, 'Format is required'),
})

export const systemSettingsSchema = z.object({
  currency: z.string().trim().min(1, 'Currency is required'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12h', '24h']),
  themeMode: z.enum(['light', 'dark', 'system']),
  numbering: numberingSettingsSchema,
})

export type BusinessSettingsFormInput = z.input<typeof businessSettingsSchema>
export type BusinessSettingsFormOutput = z.output<typeof businessSettingsSchema>
export type ReceiptSettingsFormInput = z.input<typeof receiptSettingsSchema>
export type ReceiptSettingsFormOutput = z.output<typeof receiptSettingsSchema>
export type BranchFormInput = z.input<typeof branchFormSchema>
export type BranchFormOutput = z.output<typeof branchFormSchema>
export type WarehouseFormInput = z.input<typeof warehouseFormSchema>
export type WarehouseFormOutput = z.output<typeof warehouseFormSchema>
export type SecuritySettingsFormInput = z.input<typeof securitySettingsSchema>
export type SecuritySettingsFormOutput = z.output<typeof securitySettingsSchema>
export type NotificationSettingsFormInput = z.input<typeof notificationSettingsSchema>
export type NotificationSettingsFormOutput = z.output<typeof notificationSettingsSchema>
export type TaxFormInput = z.input<typeof taxFormSchema>
export type TaxFormOutput = z.output<typeof taxFormSchema>
export type BackupSettingsFormInput = z.input<typeof backupSettingsSchema>
export type BackupSettingsFormOutput = z.output<typeof backupSettingsSchema>
export type SystemSettingsFormInput = z.input<typeof systemSettingsSchema>
export type SystemSettingsFormOutput = z.output<typeof systemSettingsSchema>
