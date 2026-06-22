import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import {
  GuestRoute,
  ProtectedRoute,
  RootRedirect,
} from '@/features/auth/components/ProtectedRoute'
import { RoleGuard } from '@/features/auth/components/RoleGuard'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import {
  AddProductPage,
  EditProductPage,
  ManageVariantsPage,
  ProductDetailsPage,
  ProductListPage,
  PRODUCT_ROUTES,
} from '@/features/products'
import {
  CategoryDetailsPage,
  CategoryListPage,
  CreateCategoryPage,
  EditCategoryPage,
  CATEGORY_ROUTES,
} from '@/features/categories'
import {
  InventoryAdjustmentPage,
  InventoryDashboardPage,
  InventoryHistoryPage,
  INVENTORY_ROUTES,
  LowStockReportPage,
  StockInPage,
  StockOutPage,
} from '@/features/inventory'
import {
  CreateCustomerPage,
  CustomerDetailsPage,
  CustomerListPage,
  CustomerPurchaseHistoryPage,
  CUSTOMER_ROUTES,
  EditCustomerPage,
} from '@/features/customers'
import {
  PosSalesPage,
  ReceiptPage,
  SaleDetailsPage,
  SalesHistoryPage,
  SALES_ROUTES,
} from '@/features/sales'
import { Navigate } from 'react-router-dom'
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage'
import { PurchasesPage } from '@/features/purchases/pages/PurchasesPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { BranchesPage } from '@/features/branches/pages/BranchesPage'
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { ROUTES } from '@/constants/routes'

function withRoleGuard(path: string, element: React.ReactNode) {
  return <RoleGuard path={path}>{element}</RoleGuard>
}

const productRoutes: RouteObject[] = [
  {
    path: ROUTES.PRODUCTS,
    element: withRoleGuard(ROUTES.PRODUCTS, <ProductListPage />),
  },
  {
    path: PRODUCT_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.PRODUCTS, <AddProductPage />),
  },
  {
    path: '/products/:id/edit',
    element: withRoleGuard(ROUTES.PRODUCTS, <EditProductPage />),
  },
  {
    path: '/products/:id/variants',
    element: withRoleGuard(ROUTES.PRODUCTS, <ManageVariantsPage />),
  },
  {
    path: '/products/:id',
    element: withRoleGuard(ROUTES.PRODUCTS, <ProductDetailsPage />),
  },
]

const categoryRoutes: RouteObject[] = [
  {
    path: ROUTES.CATEGORIES,
    element: withRoleGuard(ROUTES.CATEGORIES, <CategoryListPage />),
  },
  {
    path: CATEGORY_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.CATEGORIES, <CreateCategoryPage />),
  },
  {
    path: '/categories/:id/edit',
    element: withRoleGuard(ROUTES.CATEGORIES, <EditCategoryPage />),
  },
  {
    path: '/categories/:id',
    element: withRoleGuard(ROUTES.CATEGORIES, <CategoryDetailsPage />),
  },
]

const inventoryRoutes: RouteObject[] = [
  {
    path: ROUTES.INVENTORY,
    element: withRoleGuard(ROUTES.INVENTORY, <InventoryDashboardPage />),
  },
  {
    path: INVENTORY_ROUTES.STOCK_IN,
    element: withRoleGuard(ROUTES.INVENTORY, <StockInPage />),
  },
  {
    path: INVENTORY_ROUTES.STOCK_OUT,
    element: withRoleGuard(ROUTES.INVENTORY, <StockOutPage />),
  },
  {
    path: INVENTORY_ROUTES.ADJUSTMENT,
    element: withRoleGuard(ROUTES.INVENTORY, <InventoryAdjustmentPage />),
  },
  {
    path: INVENTORY_ROUTES.HISTORY,
    element: withRoleGuard(ROUTES.INVENTORY, <InventoryHistoryPage />),
  },
  {
    path: INVENTORY_ROUTES.LOW_STOCK,
    element: withRoleGuard(ROUTES.INVENTORY, <LowStockReportPage />),
  },
]

const salesRoutes: RouteObject[] = [
  {
    path: ROUTES.SALES,
    element: withRoleGuard(ROUTES.SALES, <Navigate to={SALES_ROUTES.NEW} replace />),
  },
  {
    path: SALES_ROUTES.NEW,
    element: withRoleGuard(ROUTES.SALES, <PosSalesPage />),
  },
  {
    path: SALES_ROUTES.HISTORY,
    element: withRoleGuard(ROUTES.SALES, <SalesHistoryPage />),
  },
  {
    path: '/sales/:id/receipt',
    element: withRoleGuard(ROUTES.SALES, <ReceiptPage />),
  },
  {
    path: '/sales/:id',
    element: withRoleGuard(ROUTES.SALES, <SaleDetailsPage />),
  },
]

const customerRoutes: RouteObject[] = [
  {
    path: ROUTES.CUSTOMERS,
    element: withRoleGuard(ROUTES.CUSTOMERS, <CustomerListPage />),
  },
  {
    path: CUSTOMER_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.CUSTOMERS, <CreateCustomerPage />),
  },
  {
    path: '/customers/:id/edit',
    element: withRoleGuard(ROUTES.CUSTOMERS, <EditCustomerPage />),
  },
  {
    path: '/customers/:id/purchases',
    element: withRoleGuard(ROUTES.CUSTOMERS, <CustomerPurchaseHistoryPage />),
  },
  {
    path: '/customers/:id',
    element: withRoleGuard(ROUTES.CUSTOMERS, <CustomerDetailsPage />),
  },
]

const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: withRoleGuard(ROUTES.DASHBOARD, <DashboardPage />),
  },
  ...productRoutes,
  ...categoryRoutes,
  ...inventoryRoutes,
  ...customerRoutes,
  ...salesRoutes,
  {
    path: ROUTES.SUPPLIERS,
    element: withRoleGuard(ROUTES.SUPPLIERS, <SuppliersPage />),
  },
  {
    path: ROUTES.PURCHASES,
    element: withRoleGuard(ROUTES.PURCHASES, <PurchasesPage />),
  },
  {
    path: ROUTES.REPORTS,
    element: withRoleGuard(ROUTES.REPORTS, <ReportsPage />),
  },
  {
    path: ROUTES.USERS,
    element: withRoleGuard(ROUTES.USERS, <UsersPage />),
  },
  {
    path: ROUTES.BRANCHES,
    element: withRoleGuard(ROUTES.BRANCHES, <BranchesPage />),
  },
  {
    path: ROUTES.AUDIT_LOGS,
    element: withRoleGuard(ROUTES.AUDIT_LOGS, <AuditLogsPage />),
  },
  {
    path: ROUTES.SETTINGS,
    element: withRoleGuard(ROUTES.SETTINGS, <SettingsPage />),
  },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: dashboardRoutes,
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
])
