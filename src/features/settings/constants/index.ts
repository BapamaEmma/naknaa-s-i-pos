import {
  Building2,
  Bell,
  Database,
  FileText,
  Lock,
  Percent,
  Settings2,
  Store,
  Warehouse,
} from 'lucide-react'
import type { SettingsDashboardCard } from '@/features/settings/types'

export const SETTINGS_ROUTES = {
  ROOT: '/settings',
  BUSINESS: '/settings/business',
  RECEIPTS: '/settings/receipts',
  BRANCHES: '/settings/branches',
  WAREHOUSES: '/settings/warehouses',
  SECURITY: '/settings/security',
  NOTIFICATIONS: '/settings/notifications',
  TAX: '/settings/tax',
  BACKUPS: '/settings/backups',
  SYSTEM: '/settings/system',
} as const

export const SETTINGS_API_ENDPOINTS = {
  BUSINESS: '/settings/business',
  RECEIPTS: '/settings/receipts',
  BRANCHES: '/settings/branches',
  WAREHOUSES: '/settings/warehouses',
  SECURITY: '/settings/security',
  NOTIFICATIONS: '/settings/notifications',
  TAX: '/settings/tax',
  BACKUPS: '/settings/backups',
  SYSTEM: '/settings/system',
  AUDIT: '/settings/audit',
} as const

export const SETTINGS_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const

export const BACKUP_SCHEDULE_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
} as const

export const BACKUP_STATUS_LABELS = {
  success: 'Success',
  failed: 'Failed',
  pending: 'Pending',
  never: 'Never',
} as const

export const THEME_MODE_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const

export const DATE_FORMAT_LABELS = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
} as const

export const TIME_FORMAT_LABELS = {
  '12h': '12-hour',
  '24h': '24-hour',
} as const

export const CURRENCY_OPTIONS = [
  { value: 'GHS', label: 'GHS (Ghana Cedi)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
] as const

export const SETTINGS_DASHBOARD_CARDS: SettingsDashboardCard[] = [
  {
    id: 'business',
    title: 'Business Settings',
    description: 'Company name, contact details, logo, and tax ID.',
    href: SETTINGS_ROUTES.BUSINESS,
  },
  {
    id: 'receipts',
    title: 'Receipt Settings',
    description: 'Receipt layout, footer, and printer configuration.',
    href: SETTINGS_ROUTES.RECEIPTS,
  },
  {
    id: 'branches',
    title: 'Branch Settings',
    description: 'Manage store branches, codes, and managers.',
    href: SETTINGS_ROUTES.BRANCHES,
  },
  {
    id: 'warehouses',
    title: 'Warehouse Settings',
    description: 'Configure warehouse locations and status.',
    href: SETTINGS_ROUTES.WAREHOUSES,
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Password policy, sessions, and lockout rules.',
    href: SETTINGS_ROUTES.SECURITY,
  },
  {
    id: 'tax',
    title: 'Tax Settings',
    description: 'VAT, NHIL, GETFund, and other tax rates.',
    href: SETTINGS_ROUTES.TAX,
  },
  {
    id: 'backups',
    title: 'Backup Settings',
    description: 'Manual and scheduled data backups.',
    href: SETTINGS_ROUTES.BACKUPS,
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Alerts for stock, sales, transfers, and users.',
    href: SETTINGS_ROUTES.NOTIFICATIONS,
  },
  {
    id: 'system',
    title: 'System Preferences',
    description: 'Currency, date/time formats, theme, and numbering.',
    href: SETTINGS_ROUTES.SYSTEM,
  },
]

export const SETTINGS_CARD_ICONS = {
  business: Store,
  receipts: FileText,
  branches: Building2,
  warehouses: Warehouse,
  security: Lock,
  tax: Percent,
  backups: Database,
  notifications: Bell,
  system: Settings2,
} as const

export const DEFAULT_BUSINESS_NAME = 'NakNaa Electronics'
