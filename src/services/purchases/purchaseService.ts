import type {
  CreatePurchaseInput,
  CreatePurchaseOrderInput,
  PurchaseDashboardSummary,
  PurchaseDetail,
  PurchaseListFilters,
  PurchaseListResult,
  PurchaseOrder,
  PurchaseReports,
  ReceivePurchaseInput,
  SupplierPurchaseHistoryItem,
  UpdatePurchaseInput,
  WarehousePurchaseSummaryItem,
} from '@/features/purchases/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  buildQueryParams,
  mapPurchase,
  toPurchaseStatus,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function toPurchaseListQuery(filters: PurchaseListFilters) {
  const params: Record<string, string | number | undefined> = {
    search: filters.search,
    warehouseId: filters.warehouseId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.purchaseStatus && filters.purchaseStatus !== 'all') {
    params.status = toPurchaseStatus(filters.purchaseStatus)
  }

  return buildQueryParams(params)
}

function toPurchaseItemsPayload(items: CreatePurchaseInput['items']) {
  return items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    costPrice: item.costPrice,
    section: item.section,
    rack: item.rack,
    bin: item.bin,
  }))
}

function toCreatePurchasePayload(input: CreatePurchaseInput) {
  return {
    supplierId: input.supplierId,
    warehouseId: input.warehouseId,
    purchaseDate: input.purchaseDate,
    status: toPurchaseStatus(input.purchaseStatus),
    notes: input.notes,
    items: toPurchaseItemsPayload(input.items),
  }
}

function toUpdatePurchasePayload(input: UpdatePurchaseInput) {
  return toCreatePurchasePayload(input)
}

export const purchaseService = {
  async getPurchases(filters: PurchaseListFilters = {}): Promise<PurchaseListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.purchases, {
      params: toPurchaseListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapPurchase(item)),
      meta: paged.meta,
    }
  },

  async getPurchaseById(id: string): Promise<PurchaseDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.purchase(id))
    return mapPurchase(dto)
  },

  async createPurchase(input: CreatePurchaseInput): Promise<PurchaseDetail> {
    const dto = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.purchases,
      toCreatePurchasePayload(input),
    )
    return mapPurchase(dto)
  },

  async updatePurchase(id: string, input: UpdatePurchaseInput): Promise<PurchaseDetail> {
    const dto = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.purchase(id),
      toUpdatePurchasePayload(input),
    )
    return mapPurchase(dto)
  },

  async deletePurchase(id: string, _userId: string, _userName: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.purchase(id))
  },

  async receivePurchase(input: ReceivePurchaseInput): Promise<PurchaseDetail> {
    const dto = await apiPost<Record<string, unknown>>(API_ENDPOINTS.purchasesReceive, {
      purchaseId: input.purchaseId,
      items: input.items.map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantity: item.quantity,
      })),
    })
    return mapPurchase(dto)
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return []
  },

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const detail = await this.createPurchase({
      supplierId: input.supplierId,
      warehouseId: input.warehouseId,
      purchaseDate: new Date().toISOString(),
      invoiceNumber: '',
      paymentStatus: 'unpaid',
      purchaseStatus: 'draft',
      notes: input.notes,
      items: input.items.map((item) => ({
        ...item,
        section: 'MAIN',
        rack: 'R1',
        bin: 'B1',
      })),
      userId: input.userId,
      userName: input.userName,
    })

    return {
      id: detail.id,
      orderNumber: detail.purchaseNumber,
      supplierId: detail.supplierId,
      supplierName: detail.supplierName,
      warehouseId: detail.warehouseId,
      warehouseName: detail.warehouseName,
      status: 'draft',
      notes: detail.notes,
      items: detail.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productVariantId: item.productVariantId,
        variantName: item.variantName,
        quantity: item.quantity,
        costPrice: item.costPrice,
      })),
      createdBy: input.userId,
      createdByName: input.userName,
      createdAt: detail.createdAt,
    }
  },

  async getDashboardSummary(): Promise<PurchaseDashboardSummary> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.purchasesDashboard)
    return {
      totalPurchases: Number(dto.totalPurchases ?? 0),
      purchaseValue: Number(dto.purchaseValue ?? 0),
      pendingPurchases: Number(dto.pendingPurchases ?? 0),
      receivedPurchases: Number(dto.receivedPurchases ?? 0),
      unpaidPurchases: 0,
    }
  },

  async getReports(): Promise<PurchaseReports> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.purchasesReports)
    const bySupplier = Array.isArray(dto.bySupplier)
      ? dto.bySupplier.map((item) => {
          const entry = item as Record<string, unknown>
          return {
            supplierId: String(entry.supplierId),
            supplierName: String(entry.supplierName ?? ''),
            totalPurchases: Number(entry.totalPurchases ?? 0),
            totalAmount: Number(entry.totalAmount ?? 0),
          }
        })
      : []

    const byWarehouse = Array.isArray(dto.byWarehouse)
      ? dto.byWarehouse.map((item) => {
          const entry = item as Record<string, unknown>
          return {
            warehouseId: String(entry.warehouseId),
            warehouseName: String(entry.warehouseName ?? ''),
            totalPurchases: Number(entry.totalPurchases ?? 0),
            totalAmount: Number(entry.totalAmount ?? 0),
          }
        })
      : []

    const monthly = Array.isArray(dto.monthly)
      ? dto.monthly.map((item) => {
          const entry = item as Record<string, unknown>
          return {
            month: String(entry.month ?? ''),
            purchases: Number(entry.purchases ?? 0),
            value: Number(entry.value ?? 0),
          }
        })
      : []

    return {
      totalPurchases: Number(dto.totalPurchases ?? 0),
      totalPurchaseValue: Number(dto.totalPurchaseValue ?? 0),
      bySupplier,
      byWarehouse,
      monthly,
    }
  },

  async getSupplierPurchaseHistory(): Promise<SupplierPurchaseHistoryItem[]> {
    const reports = await this.getReports()
    return reports.bySupplier.map((entry) => ({
      supplierId: entry.supplierId,
      supplierName: entry.supplierName,
      totalPurchases: entry.totalPurchases,
      totalAmount: entry.totalAmount,
      lastPurchaseDate: null,
    }))
  },

  async getWarehousePurchaseSummary(): Promise<WarehousePurchaseSummaryItem[]> {
    const reports = await this.getReports()
    return reports.byWarehouse.map((entry) => ({
      warehouseId: entry.warehouseId,
      warehouseName: entry.warehouseName,
      productsReceived: entry.totalPurchases,
      inventoryValue: entry.totalAmount,
    }))
  },

  async getReceivablePurchases(): Promise<PurchaseDetail[]> {
    const [ordered, draft] = await Promise.all([
      this.getPurchases({ purchaseStatus: 'ordered', limit: 100, page: 1 }),
      this.getPurchases({ purchaseStatus: 'draft', limit: 100, page: 1 }),
    ])

    const purchaseIds = new Set<string>()
    const summaries = [...ordered.data, ...draft.data].filter((entry) => {
      if (purchaseIds.has(entry.id)) return false
      purchaseIds.add(entry.id)
      return true
    })

    return Promise.all(summaries.map((entry) => this.getPurchaseById(entry.id)))
  },
}
