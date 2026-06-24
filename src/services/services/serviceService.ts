import type {
  CreateServiceCategoryInput,
  CreateServiceInput,
  CreateServiceJobInput,
  CustomerServiceHistoryItem,
  ServiceAnalytics,
  ServiceCategory,
  ServiceDashboardSummary,
  ServiceDetail,
  ServiceJobDetail,
  ServiceJobListFilters,
  ServiceJobListResult,
  ServiceJobReceipt,
  ServiceListFilters,
  ServiceListResult,
  Technician,
  UpdateServiceCategoryInput,
  UpdateServiceInput,
  UpdateServiceJobInput,
} from '@/features/services/types'
import { BUSINESS_NAME } from '@/features/services/constants'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  buildQueryParams,
  fromServiceJobStatus,
  mapServiceJobDetail,
  mapServiceListItem,
  toServiceJobStatus,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

const DEFAULT_CATEGORY: ServiceCategory = {
  id: 'general',
  categoryName: 'General',
  description: 'Default service category',
  status: 'active',
}

function toServiceListQuery(filters: ServiceListFilters) {
  const params: Record<string, string | number | boolean | undefined> = {
    search: filters.search,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.status === 'active') params.isActive = true
  if (filters.status === 'inactive') params.isActive = false

  return buildQueryParams(params)
}

function toServiceJobListQuery(filters: ServiceJobListFilters) {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    customerId: filters.customerId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = toServiceJobStatus(filters.status)
  }

  if (filters.historyOnly) {
    params.status = toServiceJobStatus('completed')
  }

  return buildQueryParams(params)
}

async function buildAnalytics(): Promise<ServiceAnalytics> {
  const jobs = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.serviceJobs, {
    params: { page: 1, pageSize: 200 },
  })

  const completed = jobs.items.filter((item) => {
    const status = String(item.status ?? '')
    return status === 'Completed' || status === 'completed' || item.status === 3
  })

  const monthlyMap = new Map<string, number>()
  const technicianMap = new Map<string, { jobs: number; revenue: number }>()

  for (const job of completed) {
    const amount = Number(job.price ?? job.amount ?? 0)
    const createdAt = String(job.createdAt ?? new Date().toISOString())
    const month = new Date(createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + amount)

    const technician = String(job.assignedUserName ?? job.technician ?? 'Unassigned')
    const current = technicianMap.get(technician) ?? { jobs: 0, revenue: 0 }
    current.jobs += 1
    current.revenue += amount
    technicianMap.set(technician, current)
  }

  return {
    monthlyRevenue: [...monthlyMap.entries()].map(([month, revenue]) => ({ month, revenue })),
    categoryPerformance: [
      {
        categoryName: DEFAULT_CATEGORY.categoryName,
        jobs: completed.length,
        revenue: completed.reduce((sum, job) => sum + Number(job.price ?? job.amount ?? 0), 0),
      },
    ],
    technicianPerformance: [...technicianMap.entries()].map(([technician, data]) => ({
      technician,
      ...data,
    })),
  }
}

export const serviceService = {
  async getDashboardSummary(): Promise<ServiceDashboardSummary> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.servicesDashboard)
    return {
      totalServices: Number(dto.totalServices ?? 0),
      completedJobs: Number(dto.completedJobs ?? 0),
      pendingJobs: Number(dto.pendingJobs ?? 0),
      serviceRevenue: Number(dto.serviceRevenue ?? 0),
    }
  },

  async getAnalytics(): Promise<ServiceAnalytics> {
    return buildAnalytics()
  },

  async getTechnicians(): Promise<Technician[]> {
    const users = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.users, {
      params: { page: 1, pageSize: 100, isActive: true },
    })

    return users.items.map((user) => ({
      id: String(user.id),
      name: String(user.fullName ?? user.username ?? ''),
      phoneNumber: String(user.phoneNumber ?? ''),
      specialization: String(user.roleName ?? 'Technician'),
      status: 'active',
    }))
  },

  async getCategories(): Promise<ServiceCategory[]> {
    return [DEFAULT_CATEGORY]
  },

  async createCategory(input: CreateServiceCategoryInput): Promise<ServiceCategory> {
    return {
      id: crypto.randomUUID(),
      categoryName: input.categoryName.trim(),
      description: input.description.trim(),
      status: input.status,
    }
  },

  async updateCategory(id: string, input: UpdateServiceCategoryInput): Promise<ServiceCategory> {
    return {
      id,
      categoryName: input.categoryName.trim(),
      description: input.description.trim(),
      status: input.status,
    }
  },

  async deleteCategory(_id: string): Promise<void> {
    return
  },

  async getServices(filters: ServiceListFilters = {}): Promise<ServiceListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.services, {
      params: toServiceListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapServiceListItem(item)),
      meta: paged.meta,
    }
  },

  async getServiceById(id: string): Promise<ServiceDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.service(id))
    return mapServiceListItem(dto)
  },

  async createService(input: CreateServiceInput): Promise<ServiceDetail> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.services, {
      serviceName: input.serviceName.trim(),
      price: input.standardPrice,
      description: input.description.trim(),
      isActive: input.status === 'active',
    })
    return mapServiceListItem(dto)
  },

  async updateService(id: string, input: UpdateServiceInput): Promise<ServiceDetail> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.service(id), {
      serviceName: input.serviceName.trim(),
      price: input.standardPrice,
      description: input.description.trim(),
      isActive: input.status === 'active',
    })
    return mapServiceListItem(dto)
  },

  async deleteService(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.service(id))
  },

  async getServiceJobs(filters: ServiceJobListFilters = {}): Promise<ServiceJobListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.serviceJobs, {
      params: toServiceJobListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapServiceJobDetail(item)),
      meta: paged.meta,
    }
  },

  async getServiceJobById(id: string): Promise<ServiceJobDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.serviceJob(id))
    return mapServiceJobDetail(dto)
  },

  async createServiceJob(input: CreateServiceJobInput): Promise<ServiceJobDetail> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.serviceJobs, {
      serviceId: input.serviceId,
      customerId: input.customerId,
      assignedUserId: input.technicianId,
      price: input.amount,
      notes: input.notes.trim(),
    })
    return mapServiceJobDetail(dto)
  },

  async updateServiceJob(id: string, input: UpdateServiceJobInput): Promise<ServiceJobDetail> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.serviceJob(id), {
      serviceId: input.serviceId,
      customerId: input.customerId,
      assignedUserId: input.technicianId,
      status: toServiceJobStatus(input.status),
      price: input.amount,
      notes: input.notes.trim(),
      completedAt: input.completionDate ?? (input.status === 'completed' ? new Date().toISOString() : null),
    })
    return mapServiceJobDetail(dto)
  },

  async deleteServiceJob(id: string): Promise<void> {
    const current = await this.getServiceJobById(id)
    await this.updateServiceJob(id, {
      customerId: current.customerId,
      serviceId: current.serviceId,
      technicianId: current.technicianId,
      serviceDate: current.serviceDate,
      expectedCompletionDate: current.expectedCompletionDate,
      completionDate: current.completionDate,
      status: 'cancelled',
      amount: current.amount,
      notes: current.notes,
    })
  },

  async getJobReceipt(id: string): Promise<ServiceJobReceipt> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.serviceJobReceipt(id))
    return {
      id: String(dto.id),
      jobNumber: String(dto.jobNumber ?? ''),
      customerName: String(dto.customerName ?? ''),
      serviceName: String(dto.serviceName ?? ''),
      amount: Number(dto.amount ?? dto.price ?? 0),
      serviceDate: String(dto.serviceDate ?? dto.completedAt ?? new Date().toISOString()),
      completionDate: dto.completedAt ? String(dto.completedAt) : null,
      technician: String(dto.assignedUserName ?? dto.technician ?? ''),
      status: fromServiceJobStatus(dto.status ?? 1),
      businessName: String(dto.businessName ?? BUSINESS_NAME),
      issuedAt: String(dto.issuedAt ?? new Date().toISOString()),
    }
  },

  async getCustomerServiceHistory(customerId: string): Promise<CustomerServiceHistoryItem[]> {
    const result = await this.getServiceJobs({ customerId, limit: 100, page: 1 })
    return result.data.map((job) => ({
      id: job.id,
      jobNumber: job.jobNumber,
      serviceName: job.serviceName,
      amount: job.amount,
      serviceDate: job.serviceDate,
      status: job.status,
    }))
  },
}
