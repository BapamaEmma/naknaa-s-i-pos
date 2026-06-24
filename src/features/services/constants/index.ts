export const SERVICE_API_ENDPOINTS = {
  LIST: '/services',
  DETAIL: (id: string) => `/services/${id}`,
  CATEGORIES: '/services/categories',
  JOBS: '/services/jobs',
  DASHBOARD: '/services/dashboard',
  ANALYTICS: '/services/analytics',
  TECHNICIANS: '/services/technicians',
} as const

export const SERVICE_ROUTES = {
  LIST: '/services',
  CREATE: '/services/create',
  DETAIL: (id: string) => `/services/${id}`,
  EDIT: (id: string) => `/services/${id}/edit`,
  CATEGORIES: '/services/categories',
  JOBS: '/services/jobs',
  JOB_CREATE: '/services/jobs/create',
  JOB_DETAIL: (id: string) => `/services/jobs/${id}`,
  JOB_EDIT: (id: string) => `/services/jobs/${id}/edit`,
  JOB_RECEIPT: (id: string) => `/services/jobs/${id}/receipt`,
} as const

export const SERVICE_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const

export const SERVICE_JOB_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

export const BUSINESS_NAME = 'NakNaa Electronics'
