import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '@/services/api/client'
import type { ApiResponse, PagedResult } from '@/services/api/types'
import type { ApiError } from '@/types/common'

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    const error: ApiError = {
      message: response.message || 'Request failed',
    }
    throw error
  }

  return response.data
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, config)
  return unwrap(data)
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body, config)
  return unwrap(data)
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body, config)
  return unwrap(data)
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url, config)
  return unwrap(data)
}

export function toPagedMeta<T>(
  result: PagedResult<T>,
  limit?: number,
): { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } } {
  return {
    data: result.items,
    meta: {
      page: result.page,
      limit: limit ?? result.pageSize,
      total: result.totalCount,
      totalPages: result.totalPages,
    },
  }
}
