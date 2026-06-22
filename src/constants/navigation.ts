import {
  Building2,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
  UserCircle,
  ScrollText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { USER_ROLES, type UserRole } from '@/constants/roles'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Categories',
    href: ROUTES.CATEGORIES,
    icon: Tags,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Products',
    href: ROUTES.PRODUCTS,
    icon: Package,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: UserCircle,
    roles: [USER_ROLES.ADMIN],
  },
  {
    title: 'Sales',
    href: ROUTES.SALES,
    icon: ShoppingCart,
    roles: [USER_ROLES.ADMIN],
  },
  {
    title: 'Inventory',
    href: ROUTES.INVENTORY,
    icon: Warehouse,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Suppliers',
    href: ROUTES.SUPPLIERS,
    icon: Truck,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Purchases',
    href: ROUTES.PURCHASES,
    icon: ClipboardList,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STOREKEEPER],
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: FileBarChart,
    roles: [USER_ROLES.ADMIN],
  },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: Users,
    roles: [USER_ROLES.ADMIN],
  },
  {
    title: 'Branches',
    href: ROUTES.BRANCHES,
    icon: Building2,
    roles: [USER_ROLES.ADMIN],
  },
  {
    title: 'Audit Logs',
    href: ROUTES.AUDIT_LOGS,
    icon: ScrollText,
    roles: [USER_ROLES.ADMIN],
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: [USER_ROLES.ADMIN],
  },
]

export const APP_NAME = 'NakNaa Electronics'
export const APP_TAGLINE = 'POS & Inventory Management'

export function getNavItemsForRole(role: UserRole): NavItem[] {
  const allItems = [...MAIN_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  return allItems.filter((item) => item.roles.includes(role))
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  const allItems = [...MAIN_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  const navItem = allItems.find((item) => item.href === path)

  if (!navItem) {
    return path === ROUTES.DASHBOARD
  }

  return navItem.roles.includes(role)
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(userRole)
}
