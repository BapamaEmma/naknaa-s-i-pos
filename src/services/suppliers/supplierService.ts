import type {
  CreateSupplierInput,
  CreateSupplierProductInput,
  SupplierDetail,
  SupplierListFilters,
  SupplierListResult,
  SupplierOption,
  SupplierProductDetail,
  SupplierProductListFilters,
  SupplierProductListResult,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from '@/features/suppliers/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  buildQueryParams,
  mapSupplierDetail,
  mapSupplierListItem,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

const EMPTY_PRODUCTS_META = { page: 1, limit: 10, total: 0, totalPages: 1 }

function toSupplierListQuery(filters: SupplierListFilters) {
  const params: Record<string, string | number | boolean | undefined> = {
    search: filters.search,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.status === 'active') params.isActive = true
  if (filters.status === 'inactive') params.isActive = false

  return buildQueryParams(params)
}

function toCreateSupplierPayload(input: CreateSupplierInput) {
  return {
    supplierName: input.name.trim(),
    contactPerson: input.suppliedToPerson.trim() || input.storeName.trim() || undefined,
    phoneNumber: input.phoneNumber.trim() || undefined,
    email: input.email.trim() || undefined,
    address: [input.address.trim(), input.city.trim()].filter(Boolean).join(', ') || undefined,
    isActive: input.isActive,
  }
}

function toUpdateSupplierPayload(input: UpdateSupplierInput) {
  return toCreateSupplierPayload(input)
}

export const supplierService = {
  async getSuppliers(filters: SupplierListFilters = {}): Promise<SupplierListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.suppliers, {
      params: toSupplierListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapSupplierListItem(item)),
      meta: paged.meta,
    }
  },

  async getSupplierById(id: string): Promise<SupplierDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.supplier(id))
    return mapSupplierDetail(dto)
  },

  async getSupplierOptions(): Promise<SupplierOption[]> {
    const options = await apiGet<Array<Record<string, unknown>>>(API_ENDPOINTS.supplierOptions)
    return options.map((item) => ({
      id: String(item.id),
      name: String(item.name ?? item.supplierName ?? ''),
    }))
  },

  async createSupplier(input: CreateSupplierInput): Promise<SupplierDetail> {
    const dto = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.suppliers,
      toCreateSupplierPayload(input),
    )
    return mapSupplierDetail(dto)
  },

  async updateSupplier(id: string, input: UpdateSupplierInput): Promise<SupplierDetail> {
    const dto = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.supplier(id),
      toUpdateSupplierPayload(input),
    )
    return mapSupplierDetail(dto)
  },

  async deleteSupplier(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.supplier(id))
  },

  async getSupplierProducts(
    filters: SupplierProductListFilters = {},
  ): Promise<SupplierProductListResult> {
    return {
      data: [],
      meta: {
        ...EMPTY_PRODUCTS_META,
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
      },
    }
  },

  async getSupplierProductById(_id: string): Promise<SupplierProductDetail> {
    throw new Error('Supplier product records are not available from the API.')
  },

  async createSupplierProduct(_input: CreateSupplierProductInput): Promise<SupplierProductDetail> {
    throw new Error('Supplier product records are not available from the API.')
  },

  async updateSupplierProduct(
    _id: string,
    _input: UpdateSupplierProductInput,
  ): Promise<SupplierProductDetail> {
    throw new Error('Supplier product records are not available from the API.')
  },

  async deleteSupplierProduct(_id: string): Promise<void> {
    throw new Error('Supplier product records are not available from the API.')
  },
}
