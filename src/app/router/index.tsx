import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
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
import {
  CreateSupplierPage,
  CreateSupplierProductPage,
  EditSupplierPage,
  EditSupplierProductPage,
  SupplierDetailsPage,
  SupplierListPage,
  SupplierProductDetailsPage,
  SUPPLIER_ROUTES,
} from '@/features/suppliers'
import {
  CreateWarehousePage,
  EditWarehousePage,
  WarehouseDetailsPage,
  WarehouseListPage,
  WarehouseLocationsPage,
  WarehouseStockEntryPage,
  WarehouseTransfersPage,
  WAREHOUSE_ROUTES,
} from '@/features/warehouses'
import {
  CreatePurchasePage,
  EditPurchasePage,
  PurchaseDetailsPage,
  PurchaseListPage,
  PurchaseOrdersPage,
  ReceiveStockPage,
  PURCHASE_ROUTES,
} from '@/features/purchases'
import {
  CustomerReportPage,
  InventoryReportPage,
  ProfitLossReportPage,
  PurchaseReportPage,
  REPORT_ROUTES,
  ReportsDashboardPage,
  ReportRouteGuard,
  SalesReportPage,
  ServiceReportPage,
  SupplierReportPage,
  UserReportPage,
  WarehouseReportPage,
} from '@/features/reports'
import {
  CreateUserPage,
  EditUserPage,
  UserActivityPage,
  UserDetailsPage,
  UserListPage,
  USER_ROUTES,
} from '@/features/users'
import { BranchesPage } from '@/features/branches/pages/BranchesPage'
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage'
import {
  BackupSettingsPage,
  BranchSettingsPage,
  BusinessSettingsPage,
  NotificationSettingsPage,
  ReceiptSettingsPage,
  SecuritySettingsPage,
  SettingsPage,
  SystemSettingsPage,
  TaxSettingsPage,
  WarehouseSettingsPage,
  SETTINGS_ROUTES,
} from '@/features/settings'
import {
  CreateServiceJobPage,
  CreateServicePage,
  EditServiceJobPage,
  EditServicePage,
  ServiceCategoriesPage,
  ServiceDetailsPage,
  ServiceJobDetailsPage,
  ServiceJobReceiptPage,
  ServiceJobsPage,
  ServiceListPage,
  SERVICE_ROUTES,
} from '@/features/services'
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

const userRoutes: RouteObject[] = [
  {
    path: ROUTES.USERS,
    element: withRoleGuard(ROUTES.USERS, <UserListPage />),
  },
  {
    path: USER_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.USERS, <CreateUserPage />),
  },
  {
    path: '/users/:id/edit',
    element: withRoleGuard(ROUTES.USERS, <EditUserPage />),
  },
  {
    path: '/users/:id/activity',
    element: withRoleGuard(ROUTES.USERS, <UserActivityPage />),
  },
  {
    path: '/users/:id',
    element: withRoleGuard(ROUTES.USERS, <UserDetailsPage />),
  },
]

const warehouseRoutes: RouteObject[] = [
  {
    path: ROUTES.WAREHOUSES,
    element: withRoleGuard(ROUTES.WAREHOUSES, <WarehouseListPage />),
  },
  {
    path: WAREHOUSE_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.WAREHOUSES, <CreateWarehousePage />),
  },
  {
    path: WAREHOUSE_ROUTES.LOCATIONS,
    element: withRoleGuard(ROUTES.WAREHOUSES, <WarehouseLocationsPage />),
  },
  {
    path: WAREHOUSE_ROUTES.STOCK_ENTRY,
    element: withRoleGuard(ROUTES.WAREHOUSES, <WarehouseStockEntryPage />),
  },
  {
    path: WAREHOUSE_ROUTES.TRANSFERS,
    element: withRoleGuard(ROUTES.WAREHOUSES, <WarehouseTransfersPage />),
  },
  {
    path: '/warehouses/:id/edit',
    element: withRoleGuard(ROUTES.WAREHOUSES, <EditWarehousePage />),
  },
  {
    path: '/warehouses/:id',
    element: withRoleGuard(ROUTES.WAREHOUSES, <WarehouseDetailsPage />),
  },
]

const supplierRoutes: RouteObject[] = [
  {
    path: ROUTES.SUPPLIERS,
    element: withRoleGuard(ROUTES.SUPPLIERS, <SupplierListPage />),
  },
  {
    path: SUPPLIER_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.SUPPLIERS, <CreateSupplierPage />),
  },
  {
    path: '/suppliers/:id/edit',
    element: withRoleGuard(ROUTES.SUPPLIERS, <EditSupplierPage />),
  },
  {
    path: '/suppliers/:id/products/create',
    element: withRoleGuard(ROUTES.SUPPLIERS, <CreateSupplierProductPage />),
  },
  {
    path: '/suppliers/:id/products/:supplyId/edit',
    element: withRoleGuard(ROUTES.SUPPLIERS, <EditSupplierProductPage />),
  },
  {
    path: '/suppliers/:id/products/:supplyId',
    element: withRoleGuard(ROUTES.SUPPLIERS, <SupplierProductDetailsPage />),
  },
  {
    path: '/suppliers/:id',
    element: withRoleGuard(ROUTES.SUPPLIERS, <SupplierDetailsPage />),
  },
]

const serviceRoutes: RouteObject[] = [
  {
    path: ROUTES.SERVICES,
    element: withRoleGuard(ROUTES.SERVICES, <ServiceListPage />),
  },
  {
    path: SERVICE_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.SERVICES, <CreateServicePage />),
  },
  {
    path: SERVICE_ROUTES.CATEGORIES,
    element: withRoleGuard(ROUTES.SERVICES, <ServiceCategoriesPage />),
  },
  {
    path: SERVICE_ROUTES.JOBS,
    element: withRoleGuard(ROUTES.SERVICES, <ServiceJobsPage />),
  },
  {
    path: SERVICE_ROUTES.JOB_CREATE,
    element: withRoleGuard(ROUTES.SERVICES, <CreateServiceJobPage />),
  },
  {
    path: '/services/jobs/:id/receipt',
    element: withRoleGuard(ROUTES.SERVICES, <ServiceJobReceiptPage />),
  },
  {
    path: '/services/jobs/:id/edit',
    element: withRoleGuard(ROUTES.SERVICES, <EditServiceJobPage />),
  },
  {
    path: '/services/jobs/:id',
    element: withRoleGuard(ROUTES.SERVICES, <ServiceJobDetailsPage />),
  },
  {
    path: '/services/:id/edit',
    element: withRoleGuard(ROUTES.SERVICES, <EditServicePage />),
  },
  {
    path: '/services/:id',
    element: withRoleGuard(ROUTES.SERVICES, <ServiceDetailsPage />),
  },
]

const purchaseRoutes: RouteObject[] = [
  {
    path: ROUTES.PURCHASES,
    element: withRoleGuard(ROUTES.PURCHASES, <PurchaseListPage />),
  },
  {
    path: PURCHASE_ROUTES.CREATE,
    element: withRoleGuard(ROUTES.PURCHASES, <CreatePurchasePage />),
  },
  {
    path: PURCHASE_ROUTES.ORDERS,
    element: withRoleGuard(ROUTES.PURCHASES, <PurchaseOrdersPage />),
  },
  {
    path: PURCHASE_ROUTES.RECEIVE,
    element: withRoleGuard(ROUTES.PURCHASES, <ReceiveStockPage />),
  },
  {
    path: '/purchases/:id/edit',
    element: withRoleGuard(ROUTES.PURCHASES, <EditPurchasePage />),
  },
  {
    path: '/purchases/:id',
    element: withRoleGuard(ROUTES.PURCHASES, <PurchaseDetailsPage />),
  },
]

const reportRoutes: RouteObject[] = [
  {
    path: ROUTES.REPORTS,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.ROOT}>
        <ReportsDashboardPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.SALES,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.SALES}>
        <SalesReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.INVENTORY,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.INVENTORY}>
        <InventoryReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.PURCHASES,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.PURCHASES}>
        <PurchaseReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.WAREHOUSES,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.WAREHOUSES}>
        <WarehouseReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.CUSTOMERS,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.CUSTOMERS}>
        <CustomerReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.SUPPLIERS,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.SUPPLIERS}>
        <SupplierReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.SERVICES,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.SERVICES}>
        <ServiceReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.USERS,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.USERS}>
        <UserReportPage />
      </ReportRouteGuard>
    ),
  },
  {
    path: REPORT_ROUTES.PROFIT_LOSS,
    element: (
      <ReportRouteGuard path={REPORT_ROUTES.PROFIT_LOSS}>
        <ProfitLossReportPage />
      </ReportRouteGuard>
    ),
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
  ...userRoutes,
  ...supplierRoutes,
  ...warehouseRoutes,
  ...serviceRoutes,
  ...purchaseRoutes,
  ...reportRoutes,
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
  {
    path: SETTINGS_ROUTES.BUSINESS,
    element: withRoleGuard(ROUTES.SETTINGS, <BusinessSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.RECEIPTS,
    element: withRoleGuard(ROUTES.SETTINGS, <ReceiptSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.BRANCHES,
    element: withRoleGuard(ROUTES.SETTINGS, <BranchSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.WAREHOUSES,
    element: withRoleGuard(ROUTES.SETTINGS, <WarehouseSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.SECURITY,
    element: withRoleGuard(ROUTES.SETTINGS, <SecuritySettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.NOTIFICATIONS,
    element: withRoleGuard(ROUTES.SETTINGS, <NotificationSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.TAX,
    element: withRoleGuard(ROUTES.SETTINGS, <TaxSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.BACKUPS,
    element: withRoleGuard(ROUTES.SETTINGS, <BackupSettingsPage />),
  },
  {
    path: SETTINGS_ROUTES.SYSTEM,
    element: withRoleGuard(ROUTES.SETTINGS, <SystemSettingsPage />),
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
