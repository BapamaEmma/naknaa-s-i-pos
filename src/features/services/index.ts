export { ServiceListPage } from './pages/ServiceListPage'
export { CreateServicePage } from './pages/CreateServicePage'
export { EditServicePage } from './pages/EditServicePage'
export { ServiceDetailsPage } from './pages/ServiceDetailsPage'
export { ServiceCategoriesPage } from './pages/ServiceCategoriesPage'
export { ServiceJobsPage } from './pages/ServiceJobsPage'
export { CreateServiceJobPage } from './pages/CreateServiceJobPage'
export { ServiceJobDetailsPage } from './pages/ServiceJobDetailsPage'
export { EditServiceJobPage } from './pages/EditServiceJobPage'
export { ServiceJobReceiptPage } from './pages/ServiceJobReceiptPage'

export {
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useServiceJobs,
  useServiceJob,
  useCreateServiceJob,
  useUpdateServiceJob,
  useServiceDashboard,
  useServiceAnalytics,
  useServiceCategories,
  useTechnicians,
  useJobReceipt,
  useCustomerServiceHistory,
} from './hooks/use-services'

export { ServiceTable } from './components/ServiceTable'
export { ServiceForm } from './components/ServiceForm'
export { ServiceJobTable } from './components/ServiceJobTable'
export { ServiceJobForm } from './components/ServiceJobForm'
export { ServiceStatsCards } from './components/ServiceStatsCards'
export { ServiceRevenueChart } from './components/ServiceRevenueChart'
export { TechnicianTable } from './components/TechnicianTable'

export { SERVICE_ROUTES, SERVICE_API_ENDPOINTS } from './constants'
export type {
  Service,
  ServiceDetail,
  ServiceJob,
  ServiceJobDetail,
  ServiceCategory,
  Technician,
} from './types'
