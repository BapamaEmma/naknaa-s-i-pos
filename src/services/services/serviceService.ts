import type {
  CreateServiceCategoryInput,
  CreateServiceInput,
  CreateServiceJobInput,
  CustomerServiceHistoryItem,
  Service,
  ServiceAnalytics,
  ServiceCategory,
  ServiceDashboardSummary,
  ServiceDetail,
  ServiceJob,
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
import { SEED_CUSTOMERS } from '@/services/customers/mock-data'
import { delay, readStorage, writeStorage } from '@/services/products/storage'
import {
  SEED_SERVICE_CATEGORIES,
  SEED_SERVICE_CODE_COUNTER,
  SEED_SERVICE_JOB_COUNTER,
  SEED_SERVICE_JOBS,
  SEED_SERVICES,
  SEED_TECHNICIANS,
  SERVICE_CATEGORIES_STORAGE_KEY,
  SERVICE_CODE_COUNTER_KEY,
  SERVICE_JOB_COUNTER_KEY,
  SERVICE_JOBS_STORAGE_KEY,
  SERVICES_STORAGE_KEY,
  TECHNICIANS_STORAGE_KEY,
} from '@/services/services/mock-data'

function loadCategories(): ServiceCategory[] {
  return readStorage(SERVICE_CATEGORIES_STORAGE_KEY, SEED_SERVICE_CATEGORIES)
}

function saveCategories(categories: ServiceCategory[]): void {
  writeStorage(SERVICE_CATEGORIES_STORAGE_KEY, categories)
}

function loadServices(): Service[] {
  return readStorage(SERVICES_STORAGE_KEY, SEED_SERVICES)
}

function saveServices(services: Service[]): void {
  writeStorage(SERVICES_STORAGE_KEY, services)
}

function loadJobs(): ServiceJob[] {
  return readStorage(SERVICE_JOBS_STORAGE_KEY, SEED_SERVICE_JOBS)
}

function saveJobs(jobs: ServiceJob[]): void {
  writeStorage(SERVICE_JOBS_STORAGE_KEY, jobs)
}

function loadTechnicians(): Technician[] {
  return readStorage(TECHNICIANS_STORAGE_KEY, SEED_TECHNICIANS)
}

function getCategoryMap(): Map<string, ServiceCategory> {
  return new Map(loadCategories().map((entry) => [entry.id, entry]))
}

function generateServiceCode(): string {
  const next = readStorage(SERVICE_CODE_COUNTER_KEY, SEED_SERVICE_CODE_COUNTER) + 1
  writeStorage(SERVICE_CODE_COUNTER_KEY, next)
  return `SER-${String(next).padStart(6, '0')}`
}

function generateJobNumber(): string {
  const next = readStorage(SERVICE_JOB_COUNTER_KEY, SEED_SERVICE_JOB_COUNTER) + 1
  writeStorage(SERVICE_JOB_COUNTER_KEY, next)
  return `JOB-${String(next).padStart(6, '0')}`
}

function enrichService(service: Service) {
  const category = getCategoryMap().get(service.categoryId)
  return {
    ...service,
    categoryName: category?.categoryName ?? 'Unknown',
  }
}

function filterServices(services: Service[], filters: ServiceListFilters): Service[] {
  const search = filters.search?.trim().toLowerCase()

  return services.filter((service) => {
    const item = enrichService(service)

    if (filters.categoryId && filters.categoryId !== 'all' && service.categoryId !== filters.categoryId) {
      return false
    }

    if (filters.status === 'active' && service.status !== 'active') return false
    if (filters.status === 'inactive' && service.status !== 'inactive') return false

    if (search) {
      const haystack = [service.serviceCode, service.serviceName, item.categoryName, service.description]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

function filterJobs(jobs: ServiceJob[], filters: ServiceJobListFilters): ServiceJob[] {
  const search = filters.search?.trim().toLowerCase()

  return jobs.filter((job) => {
    if (filters.historyOnly && job.status !== 'completed') return false
    if (filters.customerId && job.customerId !== filters.customerId) return false
    if (filters.status && filters.status !== 'all' && job.status !== filters.status) return false

    if (filters.categoryId && filters.categoryId !== 'all') {
      const service = loadServices().find((entry) => entry.id === job.serviceId)
      if (!service || service.categoryId !== filters.categoryId) return false
    }

    if (filters.dateFrom && new Date(job.serviceDate).getTime() < new Date(filters.dateFrom).getTime()) {
      return false
    }

    if (filters.dateTo && new Date(job.serviceDate).getTime() > new Date(filters.dateTo).getTime()) {
      return false
    }

    if (search) {
      const haystack = [job.jobNumber, job.customerName, job.serviceName, job.technician]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

function buildAnalytics(jobs: ServiceJob[]): ServiceAnalytics {
  const completed = jobs.filter((job) => job.status === 'completed')
  const categoryMap = getCategoryMap()
  const services = loadServices()

  const monthlyMap = new Map<string, number>()
  for (const job of completed) {
    const month = new Date(job.serviceDate).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + job.amount)
  }

  const categoryPerformanceMap = new Map<string, { jobs: number; revenue: number }>()
  for (const job of completed) {
    const service = services.find((entry) => entry.id === job.serviceId)
    const categoryName = categoryMap.get(service?.categoryId ?? '')?.categoryName ?? 'Other'
    const current = categoryPerformanceMap.get(categoryName) ?? { jobs: 0, revenue: 0 }
    current.jobs += 1
    current.revenue += job.amount
    categoryPerformanceMap.set(categoryName, current)
  }

  const technicianMap = new Map<string, { jobs: number; revenue: number }>()
  for (const job of completed) {
    const current = technicianMap.get(job.technician) ?? { jobs: 0, revenue: 0 }
    current.jobs += 1
    current.revenue += job.amount
    technicianMap.set(job.technician, current)
  }

  return {
    monthlyRevenue: [...monthlyMap.entries()].map(([month, revenue]) => ({ month, revenue })),
    categoryPerformance: [...categoryPerformanceMap.entries()].map(([categoryName, data]) => ({
      categoryName,
      ...data,
    })),
    technicianPerformance: [...technicianMap.entries()].map(([technician, data]) => ({
      technician,
      ...data,
    })),
  }
}

function loadCustomers() {
  return readStorage('naknaa_customers_v2', SEED_CUSTOMERS)
}

export const serviceService = {
  async getDashboardSummary(): Promise<ServiceDashboardSummary> {
    await delay(120)
    const jobs = loadJobs()
    const completed = jobs.filter((job) => job.status === 'completed')
    const pending = jobs.filter((job) => job.status === 'pending' || job.status === 'in_progress')

    return {
      totalServices: loadServices().filter((entry) => entry.status === 'active').length,
      completedJobs: completed.length,
      pendingJobs: pending.length,
      serviceRevenue: completed.reduce((sum, job) => sum + job.amount, 0),
    }
  },

  async getAnalytics(): Promise<ServiceAnalytics> {
    await delay(120)
    return buildAnalytics(loadJobs())
  },

  async getTechnicians(): Promise<Technician[]> {
    await delay(100)
    return loadTechnicians().filter((entry) => entry.status === 'active')
  },

  async getCategories(): Promise<ServiceCategory[]> {
    await delay(100)
    return loadCategories().sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  },

  async createCategory(input: CreateServiceCategoryInput): Promise<ServiceCategory> {
    await delay()
    const category: ServiceCategory = {
      id: crypto.randomUUID(),
      categoryName: input.categoryName.trim(),
      description: input.description.trim(),
      status: input.status,
    }
    const categories = loadCategories()
    categories.push(category)
    saveCategories(categories)
    return category
  },

  async updateCategory(id: string, input: UpdateServiceCategoryInput): Promise<ServiceCategory> {
    await delay()
    const categories = loadCategories()
    const index = categories.findIndex((entry) => entry.id === id)
    if (index === -1) throw new Error('Category not found.')

    categories[index] = {
      ...categories[index],
      categoryName: input.categoryName.trim(),
      description: input.description.trim(),
      status: input.status,
    }
    saveCategories(categories)
    return categories[index]
  },

  async deleteCategory(id: string): Promise<void> {
    await delay()
    if (loadServices().some((entry) => entry.categoryId === id)) {
      throw new Error('Cannot delete a category that is assigned to services.')
    }
    saveCategories(loadCategories().filter((entry) => entry.id !== id))
  },

  async getServices(filters: ServiceListFilters = {}): Promise<ServiceListResult> {
    await delay()
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterServices(loadServices(), filters).sort((a, b) =>
      a.serviceName.localeCompare(b.serviceName),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichService),
      meta: { page, limit, total, totalPages },
    }
  },

  async getServiceById(id: string): Promise<ServiceDetail> {
    await delay()
    const service = loadServices().find((entry) => entry.id === id)
    if (!service) throw new Error('Service not found.')
    return enrichService(service)
  },

  async createService(input: CreateServiceInput): Promise<ServiceDetail> {
    await delay()
    const category = loadCategories().find((entry) => entry.id === input.categoryId)
    if (!category) throw new Error('Invalid category selected.')

    const service: Service = {
      id: crypto.randomUUID(),
      serviceCode: generateServiceCode(),
      serviceName: input.serviceName.trim(),
      categoryId: category.id,
      description: input.description.trim(),
      standardPrice: input.standardPrice,
      status: input.status,
      createdAt: new Date().toISOString(),
    }

    const services = loadServices()
    services.push(service)
    saveServices(services)
    return enrichService(service)
  },

  async updateService(id: string, input: UpdateServiceInput): Promise<ServiceDetail> {
    await delay()
    const services = loadServices()
    const index = services.findIndex((entry) => entry.id === id)
    if (index === -1) throw new Error('Service not found.')

    const category = loadCategories().find((entry) => entry.id === input.categoryId)
    if (!category) throw new Error('Invalid category selected.')

    services[index] = {
      ...services[index],
      serviceName: input.serviceName.trim(),
      categoryId: category.id,
      description: input.description.trim(),
      standardPrice: input.standardPrice,
      status: input.status,
    }
    saveServices(services)

    const jobs = loadJobs()
    let changed = false
    for (let i = 0; i < jobs.length; i += 1) {
      if (jobs[i].serviceId === id) {
        jobs[i] = { ...jobs[i], serviceName: services[index].serviceName }
        changed = true
      }
    }
    if (changed) saveJobs(jobs)

    return enrichService(services[index])
  },

  async deleteService(id: string): Promise<void> {
    await delay()
    if (loadJobs().some((entry) => entry.serviceId === id)) {
      throw new Error('Cannot delete a service with existing jobs.')
    }
    saveServices(loadServices().filter((entry) => entry.id !== id))
  },

  async getServiceJobs(filters: ServiceJobListFilters = {}): Promise<ServiceJobListResult> {
    await delay()
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterJobs(loadJobs(), filters).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getServiceJobById(id: string): Promise<ServiceJobDetail> {
    await delay()
    const job = loadJobs().find((entry) => entry.id === id)
    if (!job) throw new Error('Service job not found.')

    const service = enrichService(loadServices().find((entry) => entry.id === job.serviceId)!)
    const customer = loadCustomers().find((entry) => entry.id === job.customerId)

    return {
      ...job,
      serviceCode: service.serviceCode,
      categoryName: service.categoryName,
      customerPhone: customer?.phoneNumber ?? '',
      customerEmail: customer?.email ?? '',
    }
  },

  async createServiceJob(input: CreateServiceJobInput): Promise<ServiceJobDetail> {
    await delay()
    const customer = loadCustomers().find((entry) => entry.id === input.customerId)
    if (!customer) throw new Error('Invalid customer selected.')

    const service = loadServices().find((entry) => entry.id === input.serviceId)
    if (!service) throw new Error('Invalid service selected.')

    const technician = loadTechnicians().find((entry) => entry.id === input.technicianId)
    if (!technician) throw new Error('Invalid technician selected.')

    const now = new Date().toISOString()
    const job: ServiceJob = {
      id: crypto.randomUUID(),
      jobNumber: generateJobNumber(),
      customerId: customer.id,
      customerName: customer.fullName,
      serviceId: service.id,
      serviceName: service.serviceName,
      technicianId: technician.id,
      technician: technician.name,
      serviceDate: new Date(input.serviceDate).toISOString(),
      expectedCompletionDate: new Date(input.expectedCompletionDate).toISOString(),
      completionDate: null,
      status: 'pending',
      amount: input.amount,
      notes: input.notes.trim(),
      createdAt: now,
      updatedAt: now,
    }

    const jobs = loadJobs()
    jobs.unshift(job)
    saveJobs(jobs)
    return serviceService.getServiceJobById(job.id)
  },

  async updateServiceJob(id: string, input: UpdateServiceJobInput): Promise<ServiceJobDetail> {
    await delay()
    const jobs = loadJobs()
    const index = jobs.findIndex((entry) => entry.id === id)
    if (index === -1) throw new Error('Service job not found.')

    const customer = loadCustomers().find((entry) => entry.id === input.customerId)
    if (!customer) throw new Error('Invalid customer selected.')

    const service = loadServices().find((entry) => entry.id === input.serviceId)
    if (!service) throw new Error('Invalid service selected.')

    const technician = loadTechnicians().find((entry) => entry.id === input.technicianId)
    if (!technician) throw new Error('Invalid technician selected.')

    const completionDate =
      input.status === 'completed'
        ? input.completionDate
          ? new Date(input.completionDate).toISOString()
          : new Date().toISOString()
        : input.completionDate
          ? new Date(input.completionDate).toISOString()
          : null

    jobs[index] = {
      ...jobs[index],
      customerId: customer.id,
      customerName: customer.fullName,
      serviceId: service.id,
      serviceName: service.serviceName,
      technicianId: technician.id,
      technician: technician.name,
      serviceDate: new Date(input.serviceDate).toISOString(),
      expectedCompletionDate: new Date(input.expectedCompletionDate).toISOString(),
      completionDate,
      status: input.status,
      amount: input.amount,
      notes: input.notes.trim(),
      updatedAt: new Date().toISOString(),
    }

    saveJobs(jobs)
    return serviceService.getServiceJobById(id)
  },

  async deleteServiceJob(id: string): Promise<void> {
    await delay()
    saveJobs(loadJobs().filter((entry) => entry.id !== id))
  },

  async getJobReceipt(id: string): Promise<ServiceJobReceipt> {
    await delay(100)
    const job = await serviceService.getServiceJobById(id)
    return {
      id: job.id,
      jobNumber: job.jobNumber,
      customerName: job.customerName,
      serviceName: job.serviceName,
      amount: job.amount,
      serviceDate: job.serviceDate,
      completionDate: job.completionDate,
      technician: job.technician,
      status: job.status,
      businessName: BUSINESS_NAME,
      issuedAt: new Date().toISOString(),
    }
  },

  async getCustomerServiceHistory(customerId: string): Promise<CustomerServiceHistoryItem[]> {
    await delay(100)
    return loadJobs()
      .filter((job) => job.customerId === customerId)
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
      .map((job) => ({
        id: job.id,
        jobNumber: job.jobNumber,
        serviceName: job.serviceName,
        amount: job.amount,
        serviceDate: job.serviceDate,
        status: job.status,
      }))
  },
}
