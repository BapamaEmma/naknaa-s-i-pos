export { CustomerListPage } from './pages/CustomerListPage'
export { CreateCustomerPage } from './pages/CreateCustomerPage'
export { EditCustomerPage } from './pages/EditCustomerPage'
export { CustomerDetailsPage } from './pages/CustomerDetailsPage'
export { CustomerPurchaseHistoryPage } from './pages/CustomerPurchaseHistoryPage'

export {
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerPurchases,
  useCustomerSummary,
} from './hooks/use-customers'

export { CustomerTable } from './components/CustomerTable'
export { CustomerFilters } from './components/CustomerFilters'
export { CustomerForm } from './components/CustomerForm'
export { CustomerProfileCard } from './components/CustomerProfileCard'
export { CustomerStatsCards } from './components/CustomerStatsCards'
export { PurchaseHistoryTable } from './components/PurchaseHistoryTable'
export { CustomerNotesCard } from './components/CustomerNotesCard'
export { CustomerDashboardCards } from './components/CustomerDashboardCards'

export { CUSTOMER_ROUTES, CUSTOMER_API_ENDPOINTS } from './constants'

export type {
  Customer,
  CustomerListItem,
  CustomerDetail,
  CustomerListFilters,
  CustomerPurchaseFilters,
  CustomerStats,
  CustomerPurchase,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './types'
