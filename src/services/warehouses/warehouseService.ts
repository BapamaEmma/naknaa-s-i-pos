import type {
  CreateLocationInput,
  CreateTransferInput,
  CreateWarehouseInput,
  CreateWarehouseStockInput,
  InventoryLocationFilters,
  InventoryLocationListResult,
  LocationListFilters,
  LocationListResult,
  ProductAvailabilitySearchResult,
  ProductLocatorResult,
  TransferListFilters,
  TransferListResult,
  UpdateLocationInput,
  UpdateWarehouseInput,
  WarehouseDashboardSummary,
  WarehouseDetail,
  WarehouseInventoryReportRow,
  WarehouseListFilters,
  WarehouseListResult,
  WarehouseLocation,
  WarehouseStockRecord,
  WarehouseTransfer,
} from '@/features/warehouses/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  buildQueryParams,
  mapProductAvailability,
  mapWarehouseDetail,
  mapWarehouseListItem,
  mapWarehouseStockRecord,
  mapWarehouseTransfer,
  toEntityStatus,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function toWarehouseListQuery(filters: WarehouseListFilters) {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.status === 'active') params.status = 1
  if (filters.status === 'inactive') params.status = 2

  return buildQueryParams(params)
}

function toInventoryQuery(filters: InventoryLocationFilters, warehouseId?: string) {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    categoryId: filters.categoryId,
    stockStatus: filters.stockStatus === 'all' ? undefined : filters.stockStatus,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (warehouseId) params.warehouseId = warehouseId
  else if (filters.warehouseId && filters.warehouseId !== 'all') {
    params.warehouseId = filters.warehouseId
  }

  return buildQueryParams(params)
}

function locationKey(record: WarehouseStockRecord): string {
  return `${record.warehouseId}:${record.section}:${record.rack}:${record.bin}`
}

function stockToLocation(record: WarehouseStockRecord): WarehouseLocation {
  return {
    id: locationKey(record),
    warehouseId: record.warehouseId,
    warehouseName: record.warehouseName,
    section: record.section,
    rack: record.rack,
    bin: record.bin,
    description: '',
  }
}

async function fetchAllWarehouseInventory(warehouseId: string): Promise<WarehouseStockRecord[]> {
  const result = await apiGet<PagedResult<Record<string, unknown>>>(
    API_ENDPOINTS.warehouseInventory(warehouseId),
    { params: { page: 1, pageSize: 500 } },
  )
  return result.items.map((item) => mapWarehouseStockRecord(item))
}

export const warehouseService = {
  async getDashboardSummary(): Promise<WarehouseDashboardSummary> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.warehousesDashboard)
    return {
      totalWarehouses: Number(dto.totalWarehouses ?? 0),
      totalInventoryQuantity: Number(dto.totalInventoryQuantity ?? 0),
      totalInventoryValue: Number(dto.totalInventoryValue ?? 0),
      lowStockItems: Number(dto.lowStockItems ?? 0),
      transfersThisMonth: Number(dto.transfersThisMonth ?? 0),
    }
  },

  async getInventoryReport(): Promise<WarehouseInventoryReportRow[]> {
    const list = await this.getWarehouses({ page: 1, limit: 100 })
    const details = await Promise.all(list.data.map((warehouse) => this.getWarehouseById(warehouse.id)))

    return details.map((warehouse) => ({
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      totalProducts: warehouse.totalProducts,
      totalQuantity: warehouse.totalStockQuantity,
      inventoryValue: warehouse.inventoryValue,
    }))
  },

  async getWarehouses(filters: WarehouseListFilters = {}): Promise<WarehouseListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.warehouses, {
      params: toWarehouseListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapWarehouseListItem(item)),
      meta: paged.meta,
    }
  },

  async getWarehouseById(id: string): Promise<WarehouseDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.warehouse(id))
    return mapWarehouseDetail(dto)
  },

  async createWarehouse(input: CreateWarehouseInput): Promise<WarehouseDetail> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.warehouses, {
      warehouseName: input.warehouseName.trim(),
      description: input.description.trim(),
      address: input.address.trim(),
      manager: input.manager.trim(),
      status: toEntityStatus(input.status),
    })
    return mapWarehouseDetail(dto)
  },

  async updateWarehouse(id: string, input: UpdateWarehouseInput): Promise<WarehouseDetail> {
    const dto = await apiPut<Record<string, unknown>>(API_ENDPOINTS.warehouse(id), {
      warehouseName: input.warehouseName.trim(),
      description: input.description.trim(),
      address: input.address.trim(),
      manager: input.manager.trim(),
      status: toEntityStatus(input.status),
    })
    return mapWarehouseDetail(dto)
  },

  async deleteWarehouse(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.warehouse(id))
  },

  async getLocations(filters: LocationListFilters = {}): Promise<LocationListResult> {
    const warehouses = await this.getWarehouses({ page: 1, limit: 100 })
    const stockByWarehouse = await Promise.all(
      warehouses.data.map(async (warehouse) => fetchAllWarehouseInventory(warehouse.id)),
    )

    const locationMap = new Map<string, WarehouseLocation>()
    for (const stock of stockByWarehouse.flat()) {
      locationMap.set(locationKey(stock), stockToLocation(stock))
    }

    let locations = [...locationMap.values()]
    const search = filters.search?.trim().toLowerCase()
    if (filters.warehouseId && filters.warehouseId !== 'all') {
      locations = locations.filter((entry) => entry.warehouseId === filters.warehouseId)
    }
    if (search) {
      locations = locations.filter((entry) =>
        [entry.warehouseName, entry.section, entry.rack, entry.bin, entry.description]
          .join(' ')
          .toLowerCase()
          .includes(search),
      )
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const total = locations.length
    const start = (page - 1) * limit

    return {
      data: locations.slice(start, start + limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  },

  async createLocation(input: CreateLocationInput): Promise<WarehouseLocation> {
    return {
      id: crypto.randomUUID(),
      warehouseId: input.warehouseId,
      warehouseName: '',
      section: input.section.trim(),
      rack: input.rack.trim(),
      bin: input.bin.trim(),
      description: input.description.trim(),
    }
  },

  async updateLocation(id: string, input: UpdateLocationInput): Promise<WarehouseLocation> {
    return {
      id,
      warehouseId: input.warehouseId,
      warehouseName: '',
      section: input.section.trim(),
      rack: input.rack.trim(),
      bin: input.bin.trim(),
      description: input.description.trim(),
    }
  },

  async deleteLocation(_id: string): Promise<void> {
    return
  },

  async getInventoryLocations(
    filters: InventoryLocationFilters = {},
  ): Promise<InventoryLocationListResult> {
    if (filters.warehouseId && filters.warehouseId !== 'all') {
      const result = await apiGet<PagedResult<Record<string, unknown>>>(
        API_ENDPOINTS.warehouseInventory(filters.warehouseId),
        { params: toInventoryQuery(filters) },
      )
      const paged = toPagedMeta(result, filters.limit ?? 10)
      return {
        data: paged.data.map((item) => mapWarehouseStockRecord(item)),
        meta: paged.meta,
      }
    }

    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.inventory, {
      params: toInventoryQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapWarehouseStockRecord(item)),
      meta: paged.meta,
    }
  },

  async locateProduct(search: string): Promise<ProductLocatorResult[]> {
    const availability = await this.searchProductAvailability(search)
    return availability.results
  },

  async searchProductAvailability(search: string): Promise<ProductAvailabilitySearchResult> {
    const query = search.trim()
    if (!query) {
      return {
        status: 'not_found',
        message: 'Enter a product name, brand, or color to search.',
        query,
        results: [],
      }
    }

    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.inventorySearch, {
      params: { query },
    })
    return mapProductAvailability(dto)
  },

  async getTransfers(filters: TransferListFilters = {}): Promise<TransferListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(
      API_ENDPOINTS.warehouseTransfers,
      {
        params: buildQueryParams({
          page: filters.page ?? 1,
          pageSize: filters.limit ?? 10,
        }),
      },
    )
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapWarehouseTransfer(item)),
      meta: paged.meta,
    }
  },

  async createTransfer(input: CreateTransferInput): Promise<WarehouseTransfer> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.warehouseTransfers, {
      fromWarehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      productVariantId: input.productVariantId,
      quantity: input.quantity,
      reason: input.reason.trim(),
      notes: input.notes.trim(),
    })
    return mapWarehouseTransfer(dto)
  },

  async addWarehouseStock(input: CreateWarehouseStockInput): Promise<WarehouseStockRecord> {
    const searchQuery = [input.productName, input.brand, input.color].filter(Boolean).join(' ')
    const availability = await this.searchProductAvailability(searchQuery)
    const match =
      availability.results[0] ??
      availability.catalogMatches?.map((entry) => ({
        productVariantId: entry.productVariantId,
        productName: entry.productName,
      }))[0]

    if (!match || !('productVariantId' in match) || !match.productVariantId) {
      throw new Error(`No product found for "${input.productName}".`)
    }

    await apiPost(API_ENDPOINTS.inventoryStockIn, {
      productVariantId: match.productVariantId,
      warehouseId: input.warehouseId,
      quantity: input.quantity,
      unitCost: 0,
      section: 'MAIN',
      rack: 'R1',
      bin: 'B1',
      notes: input.notes,
    })

    const inventory = await this.getInventoryLocations({
      warehouseId: input.warehouseId,
      search: match.productName,
      limit: 20,
      page: 1,
    })

    const record = inventory.data.find((entry) => entry.productVariantId === match.productVariantId)
    if (record) return record

    throw new Error('Stock was recorded but the updated inventory row could not be loaded.')
  },
}
