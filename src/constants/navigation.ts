import {
  Building2,
  Boxes,
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
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { USER_ROLES, SHOP_STAFF_ROLES, type UserRole } from '@/constants/roles'
import { canAccessReportRoute } from '@/features/reports/constants'

const shopStaff = SHOP_STAFF_ROLES

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
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Categories',
    href: ROUTES.CATEGORIES,
    icon: Tags,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Products',
    href: ROUTES.PRODUCTS,
    icon: Package,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Suppliers',
    href: ROUTES.SUPPLIERS,
    icon: Truck,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
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
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Inventory',
    href: ROUTES.INVENTORY,
    icon: Warehouse,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Warehouses',
    href: ROUTES.WAREHOUSES,
    icon: Boxes,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Services',
    href: ROUTES.SERVICES,
    icon: Wrench,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: FileBarChart,
    roles: [USER_ROLES.ADMIN, ...shopStaff],
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
  if (path.startsWith('/reports')) {
    return canAccessReportRoute(role, path)
  }

  const allItems = [...MAIN_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  const navItem = allItems.find(
    (item) => path === item.href || path.startsWith(`${item.href}/`),
  )

  if (!navItem) {
    return path === ROUTES.DASHBOARD
  }

  return navItem.roles.includes(role)
}

export function getPageTitleFromPath(pathname: string): string {
  if (pathname.startsWith('/reports')) {
    if (pathname === '/reports') return 'Reports & Analytics'
    const segment = pathname.split('/').filter(Boolean).pop()
    if (!segment) return 'Reports & Analytics'
    return segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const allItems = [...MAIN_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  const match = allItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (match) {
    if (pathname.endsWith('/create')) {
      return `Create ${match.title.replace(/s$/, '')}`
    }

    if (pathname.includes('/edit')) {
      return `Edit ${match.title.replace(/s$/, '')}`
    }

    if (match.href === ROUTES.DASHBOARD || pathname.startsWith(ROUTES.DASHBOARD)) {
      return 'Dashboard Overview'
    }

    return match.title
  }

  return 'Dashboard Overview'
}
