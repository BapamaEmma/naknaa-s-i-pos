import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type {
  CreateServiceCategoryInput,
  CreateServiceInput,
  CreateServiceJobInput,
  ServiceJobListFilters,
  ServiceListFilters,
  UpdateServiceCategoryInput,
  UpdateServiceInput,
  UpdateServiceJobInput,
} from '@/features/services/types'
import { serviceService } from '@/services/services/serviceService'

function invalidateServiceQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_JOBS] })
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_CATEGORIES] })
}

export function useServiceDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES, 'dashboard'],
    queryFn: () => serviceService.getDashboardSummary(),
  })
}

export function useServiceAnalytics() {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES, 'analytics'],
    queryFn: () => serviceService.getAnalytics(),
  })
}

export function useServiceCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_CATEGORIES],
    queryFn: () => serviceService.getCategories(),
  })
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateServiceCategoryInput) => serviceService.createCategory(input),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceCategoryInput }) =>
      serviceService.updateCategory(id, input),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => serviceService.deleteCategory(id),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useTechnicians() {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES, 'technicians'],
    queryFn: () => serviceService.getTechnicians(),
  })
}

export function useServices(filters: ServiceListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES, filters],
    queryFn: () => serviceService.getServices(filters),
  })
}

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES, 'detail', id],
    queryFn: () => serviceService.getServiceById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateServiceInput) => serviceService.createService(input),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceInput }) =>
      serviceService.updateService(id, input),
    onSuccess: (_data, variables) => {
      invalidateServiceQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES, 'detail', variables.id] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => serviceService.deleteService(id),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useServiceJobs(filters: ServiceJobListFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_JOBS, filters],
    queryFn: () => serviceService.getServiceJobs(filters),
  })
}

export function useServiceJob(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_JOBS, 'detail', id],
    queryFn: () => serviceService.getServiceJobById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateServiceJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateServiceJobInput) => serviceService.createServiceJob(input),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useUpdateServiceJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceJobInput }) =>
      serviceService.updateServiceJob(id, input),
    onSuccess: (_data, variables) => {
      invalidateServiceQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_JOBS, 'detail', variables.id] })
    },
  })
}

export function useDeleteServiceJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => serviceService.deleteServiceJob(id),
    onSuccess: () => invalidateServiceQueries(queryClient),
  })
}

export function useJobReceipt(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_JOBS, 'receipt', id],
    queryFn: () => serviceService.getJobReceipt(id!),
    enabled: Boolean(id),
  })
}

export function useCustomerServiceHistory(customerId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_JOBS, 'customer-history', customerId],
    queryFn: () => serviceService.getCustomerServiceHistory(customerId!),
    enabled: Boolean(customerId),
  })
}
