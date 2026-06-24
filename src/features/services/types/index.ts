export type ServiceStatus = 'active' | 'inactive'
export type ServiceCategoryStatus = 'active' | 'inactive'
export type ServiceJobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TechnicianStatus = 'active' | 'inactive'

export interface ServiceCategory {
  id: string
  categoryName: string
  description: string
  status: ServiceCategoryStatus
}

export interface Service {
  id: string
  serviceCode: string
  serviceName: string
  categoryId: string
  description: string
  standardPrice: number
  status: ServiceStatus
  createdAt: string
}

export interface ServiceListItem extends Service {
  categoryName: string
}

export interface ServiceDetail extends ServiceListItem {}

export interface Technician {
  id: string
  name: string
  phoneNumber: string
  specialization: string
  status: TechnicianStatus
}

export interface ServiceJob {
  id: string
  jobNumber: string
  customerId: string
  customerName: string
  serviceId: string
  serviceName: string
  technicianId: string
  technician: string
  serviceDate: string
  expectedCompletionDate: string
  completionDate: string | null
  status: ServiceJobStatus
  amount: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ServiceJobListItem extends ServiceJob {}

export interface ServiceJobDetail extends ServiceJob {
  customerPhone: string
  customerEmail: string
  serviceCode: string
  categoryName: string
}

export interface ServiceJobReceipt {
  id: string
  jobNumber: string
  customerName: string
  serviceName: string
  amount: number
  serviceDate: string
  completionDate: string | null
  technician: string
  status: ServiceJobStatus
  businessName: string
  issuedAt: string
}

export interface ServiceListFilters {
  search?: string
  categoryId?: string | 'all'
  status?: 'all' | ServiceStatus
  page?: number
  limit?: number
}

export interface ServiceListResult {
  data: ServiceListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ServiceJobListFilters {
  search?: string
  status?: 'all' | ServiceJobStatus
  categoryId?: string | 'all'
  dateFrom?: string
  dateTo?: string
  historyOnly?: boolean
  customerId?: string
  page?: number
  limit?: number
}

export interface ServiceJobListResult {
  data: ServiceJobListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ServiceDashboardSummary {
  totalServices: number
  completedJobs: number
  pendingJobs: number
  serviceRevenue: number
}

export interface MonthlyServiceRevenuePoint {
  month: string
  revenue: number
}

export interface ServiceCategoryPerformancePoint {
  categoryName: string
  jobs: number
  revenue: number
}

export interface TechnicianPerformancePoint {
  technician: string
  jobs: number
  revenue: number
}

export interface ServiceAnalytics {
  monthlyRevenue: MonthlyServiceRevenuePoint[]
  categoryPerformance: ServiceCategoryPerformancePoint[]
  technicianPerformance: TechnicianPerformancePoint[]
}

export interface CreateServiceInput {
  serviceName: string
  categoryId: string
  description: string
  standardPrice: number
  status: ServiceStatus
}

export interface UpdateServiceInput extends CreateServiceInput {}

export interface CreateServiceCategoryInput {
  categoryName: string
  description: string
  status: ServiceCategoryStatus
}

export interface UpdateServiceCategoryInput extends CreateServiceCategoryInput {}

export interface CreateServiceJobInput {
  customerId: string
  serviceId: string
  technicianId: string
  serviceDate: string
  expectedCompletionDate: string
  amount: number
  notes: string
}

export interface UpdateServiceJobInput {
  customerId: string
  serviceId: string
  technicianId: string
  serviceDate: string
  expectedCompletionDate: string
  completionDate?: string | null
  status: ServiceJobStatus
  amount: number
  notes: string
}

export interface CustomerServiceHistoryItem {
  id: string
  jobNumber: string
  serviceName: string
  amount: number
  serviceDate: string
  status: ServiceJobStatus
}
