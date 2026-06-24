import { USER_ROLES, normalizeUserRole, type UserRole } from '@/constants/roles'
import type { Category } from '@/features/categories/types'
import type { ProductDetail, ProductListItem, ProductVariant } from '@/features/products/types'
import type {
  PaymentMethod,
  PosProductResult,
  ReceiptData,
  Sale,
  SaleDetail,
  SaleItem,
  SaleListItem,
  SalesDashboardSummary,
  SalesListResult,
} from '@/features/sales/types'
import type { User } from '@/types/user'
import type { PagedResult } from '@/services/api/types'

export function mapBackendRole(roleName: string): UserRole {
  const normalized = roleName.trim().toLowerCase()
  if (normalized === 'administrator') return USER_ROLES.ADMIN
  if (normalized === 'storekeeper') return USER_ROLES.CASHIER
  return normalizeUserRole(normalized)
}

export function mapAuthUser(dto: {
  id: string
  firstName: string
  lastName: string
  email: string
  roleName: string
  branchId: string
}): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: mapBackendRole(dto.roleName),
    branchId: dto.branchId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function toPaymentMethod(value: PaymentMethod): number {
  return value === 'mobile_money' ? 2 : 1
}

export function fromPaymentMethod(value: number | string): PaymentMethod {
  if (value === 2 || value === 'MobileMoney' || value === 'mobile_money') return 'mobile_money'
  return 'cash'
}

export function mapProductListItem(dto: Record<string, unknown>): ProductListItem {
  return {
    id: String(dto.id),
    categoryId: String(dto.categoryId),
    name: String(dto.productName ?? dto.name ?? ''),
    brand: String(dto.brand ?? ''),
    model: String(dto.model ?? ''),
    sku: String(dto.productCode ?? dto.sku ?? ''),
    description: String(dto.description ?? ''),
    warrantyMonths: Number(dto.warrantyMonths ?? 0),
    imageUrl: String(dto.imageUrl ?? ''),
    sellingPrice: Number(dto.sellingPrice ?? 0),
    isActive: Boolean(dto.isActive),
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
    categoryName: String(dto.categoryName ?? 'Unknown'),
    variantCount: Number(dto.variantCount ?? 0),
  }
}

export function mapProductVariant(dto: Record<string, unknown>): ProductVariant {
  return {
    id: String(dto.id),
    productId: String(dto.productId),
    name: String(dto.variantName ?? dto.name ?? 'Standard'),
    variantType: String(dto.variantValue ?? dto.variantType ?? 'Default'),
    costPrice: Number(dto.costPrice ?? 0),
    sellingPrice: Number(dto.sellingPrice ?? 0),
    currentStock: Number(dto.currentStock ?? 0),
    minimumStock: Number(dto.reorderLevel ?? dto.minimumStock ?? 0),
    isActive: Boolean(dto.isActive ?? true),
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
    updatedAt: String(dto.updatedAt ?? dto.createdAt ?? new Date().toISOString()),
  }
}

export function mapProductDetail(dto: Record<string, unknown>): ProductDetail {
  const base = mapProductListItem(dto)
  const variants = Array.isArray(dto.variants)
    ? dto.variants.map((item) => mapProductVariant(item as Record<string, unknown>))
    : []
  const summary = (dto.inventorySummary ?? {}) as Record<string, unknown>

  return {
    ...base,
    variants,
    inventorySummary: {
      totalStock: Number(summary.totalStock ?? 0),
      inventoryValue: Number(summary.inventoryValue ?? 0),
      lowStockVariants: Number(summary.lowStockVariants ?? 0),
    },
  }
}

export function mapCategory(dto: Record<string, unknown>): Category {
  const name = String(dto.name ?? '')
  return {
    id: String(dto.id),
    name,
    description: String(dto.description ?? ''),
    isActive: Boolean(dto.isActive ?? true),
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
    updatedAt: String(dto.updatedAt ?? dto.createdAt ?? new Date().toISOString()),
  }
}

export function mapPosProduct(dto: Record<string, unknown>): PosProductResult {
  return {
    productId: String(dto.productId),
    productVariantId: String(dto.productVariantId),
    productName: String(dto.productName),
    brand: String(dto.brand ?? ''),
    imageUrl: String(dto.imageUrl ?? ''),
    sellingPrice: Number(dto.sellingPrice ?? 0),
    availableStock: Number(dto.availableStock ?? 0),
  }
}

export function mapSaleListItem(dto: Record<string, unknown>): SaleListItem {
  return {
    id: String(dto.id),
    receiptNumber: String(dto.receiptNumber ?? dto.saleNumber ?? ''),
    branchId: String(dto.branchId),
    branchName: String(dto.branchName ?? ''),
    customerId: dto.customerId ? String(dto.customerId) : null,
    customerName: String(dto.customerName ?? 'Walk-In Customer'),
    customerPhone: String(dto.customerPhone ?? '-'),
    cashierId: String(dto.userId ?? dto.cashierId ?? ''),
    cashierName: String(dto.cashierName ?? ''),
    paymentMethod: fromPaymentMethod(dto.paymentMethod as number | string),
    subtotal: Number(dto.subtotal ?? dto.totalAmount ?? 0),
    discount: Number(dto.discount ?? 0),
    totalAmount: Number(dto.totalAmount ?? 0),
    saleDate: String(dto.saleDate ?? new Date().toISOString()),
    status: mapSaleStatus(dto.status),
  }
}

export function mapSaleItem(dto: Record<string, unknown>): SaleItem {
  return {
    id: String(dto.id),
    saleId: String(dto.saleId),
    productId: String(dto.productId ?? ''),
    productVariantId: String(dto.productVariantId),
    productName: String(dto.productName),
    variantName: String(dto.variantName ?? ''),
    quantity: Number(dto.quantity ?? 0),
    unitPrice: Number(dto.unitPrice ?? 0),
    totalPrice: Number(dto.totalPrice ?? 0),
  }
}

export function mapSaleDetail(dto: Record<string, unknown>): SaleDetail {
  const base = mapSaleListItem(dto)
  const items = Array.isArray(dto.items)
    ? dto.items.map((item) => mapSaleItem(item as Record<string, unknown>))
    : []

  return { ...base, items }
}

export function mapReceipt(dto: Record<string, unknown>): ReceiptData {
  return mapSaleDetail(dto)
}

export function mapSalesSummary(dto: Record<string, unknown>): SalesDashboardSummary {
  return {
    todaySales: Number(dto.todaySales ?? 0),
    todayTransactions: Number(dto.todayTransactions ?? 0),
    weeklyRevenue: Number(dto.weeklyRevenue ?? 0),
    monthlyRevenue: Number(dto.monthlyRevenue ?? 0),
  }
}

export function mapPagedSales(result: PagedResult<Record<string, unknown>>): SalesListResult {
  return {
    data: result.items.map((item) => mapSaleListItem(item)),
    meta: {
      page: result.page,
      limit: result.pageSize,
      total: result.totalCount,
      totalPages: result.totalPages,
    },
  }
}

function mapSaleStatus(value: unknown): Sale['status'] {
  if (value === 2 || value === 'Voided' || value === 'voided') return 'voided'
  if (value === 3 || value === 'Refunded' || value === 'refunded') return 'refunded'
  return 'completed'
}

export function toCreateProductPayload(input: {
  name: string
  categoryId: string
  brand: string
  model?: string
  costPrice?: number
  sellingPrice?: number
  reorderLevel?: number
  imageUrl?: string
  isActive?: boolean
}) {
  return {
    productName: input.name,
    categoryId: input.categoryId,
    brand: input.brand,
    model: input.model ?? '',
    costPrice: input.costPrice ?? 0,
    sellingPrice: input.sellingPrice ?? 0,
    reorderLevel: input.reorderLevel ?? 0,
    imageUrl: input.imageUrl || undefined,
    isActive: input.isActive ?? true,
  }
}

export const BACKEND_ROLE_IDS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: '11111111-1111-1111-1111-111111111101',
  [USER_ROLES.CASHIER]: '11111111-1111-1111-1111-111111111102',
}

export const BACKEND_DEFAULT_BRANCH_ID = '22222222-2222-2222-2222-222222222201'

export function buildQueryParams(
  params: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      result[key] = value
    }
  }
  return result
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function fromEntityStatus(value: unknown): 'active' | 'inactive' {
  if (value === 2 || value === 'Inactive' || value === 'inactive') return 'inactive'
  return 'active'
}

export function toEntityStatus(value: 'active' | 'inactive' | string): number {
  return value === 'inactive' ? 2 : 1
}

export function fromPurchaseStatus(
  value: unknown,
  items?: Array<{ quantity: number; receivedQuantity: number }>,
): 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled' {
  if (value === 4 || value === 'Cancelled' || value === 'cancelled') return 'cancelled'
  if (value === 1 || value === 'Draft' || value === 'draft') return 'draft'
  if (value === 3 || value === 'Received' || value === 'received') return 'received'
  if (items?.some((item) => item.receivedQuantity > 0 && item.receivedQuantity < item.quantity)) {
    return 'partially_received'
  }
  return 'ordered'
}

export function toPurchaseStatus(
  value: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled',
): number {
  if (value === 'draft') return 1
  if (value === 'received') return 3
  if (value === 'cancelled') return 4
  return 2
}

export function fromServiceJobStatus(
  value: unknown,
): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
  if (value === 2 || value === 'InProgress' || value === 'in_progress') return 'in_progress'
  if (value === 3 || value === 'Completed' || value === 'completed') return 'completed'
  if (value === 4 || value === 'Cancelled' || value === 'cancelled') return 'cancelled'
  return 'pending'
}

export function toServiceJobStatus(
  value: 'pending' | 'in_progress' | 'completed' | 'cancelled',
): number {
  if (value === 'in_progress') return 2
  if (value === 'completed') return 3
  if (value === 'cancelled') return 4
  return 1
}

export function toIsoDate(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString()
  return typeof value === 'string' ? value : value.toISOString()
}

export function mapUserListItem(dto: Record<string, unknown>) {
  const roleName = String(dto.roleName ?? '')
  const { firstName, lastName } = splitFullName(String(dto.fullName ?? ''))
  const isActive = Boolean(dto.isActive ?? true)

  return {
    id: String(dto.id),
    employeeId: String(dto.username ?? dto.employeeId ?? ''),
    fullName: String(dto.fullName ?? `${firstName} ${lastName}`.trim()),
    username: String(dto.username ?? ''),
    email: String(dto.email ?? ''),
    phoneNumber: String(dto.phoneNumber ?? ''),
    roleId: mapBackendRole(roleName),
    roleName,
    branchId: String(dto.branchId ?? ''),
    branchName: String(dto.branchName ?? ''),
    status: (isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'suspended',
    lastLogin: dto.lastLogin ? String(dto.lastLogin) : null,
    firstName,
    lastName,
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
    updatedAt: String(dto.updatedAt ?? dto.createdAt ?? new Date().toISOString()),
    permissions: Array.isArray(dto.permissions) ? dto.permissions.map(String) : [],
  }
}

export function mapUserDetail(dto: Record<string, unknown>) {
  const base = mapUserListItem(dto)
  return {
    ...base,
    roleId: base.roleId,
    status: base.status,
    permissions: base.permissions,
  }
}

export function mapUserActivity(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    userId: String(dto.userId),
    activity: String(dto.activity ?? dto.action ?? ''),
    module: String(dto.module ?? dto.entity ?? ''),
    branchId: String(dto.branchId ?? ''),
    branchName: String(dto.branchName ?? ''),
    createdAt: String(dto.createdAt ?? dto.actionDate ?? new Date().toISOString()),
  }
}

export function mapSupplierListItem(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    name: String(dto.supplierName ?? dto.name ?? ''),
    storeName: String(dto.storeName ?? ''),
    email: String(dto.email ?? ''),
    phoneNumber: String(dto.phoneNumber ?? ''),
    productCount: Number(dto.productCount ?? 0),
    totalPurchaseValue: Number(dto.totalPurchaseValue ?? 0),
    lastSupplyDate: dto.lastSupplyDate ? String(dto.lastSupplyDate) : null,
    isActive: Boolean(dto.isActive ?? true),
  }
}

export function mapSupplierDetail(dto: Record<string, unknown>) {
  const stats = (dto.stats ?? {}) as Record<string, unknown>
  return {
    id: String(dto.id),
    name: String(dto.supplierName ?? dto.name ?? ''),
    storeName: String(dto.storeName ?? ''),
    suppliedToPerson: String(dto.contactPerson ?? dto.suppliedToPerson ?? ''),
    email: String(dto.email ?? ''),
    phoneNumber: String(dto.phoneNumber ?? ''),
    address: String(dto.address ?? ''),
    city: String(dto.city ?? ''),
    notes: String(dto.notes ?? ''),
    isActive: Boolean(dto.isActive ?? true),
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
    updatedAt: String(dto.updatedAt ?? dto.createdAt ?? new Date().toISOString()),
    stats: {
      totalProductsSupplied: Number(stats.totalProductsSupplied ?? 0),
      totalQuantitySupplied: Number(stats.totalQuantitySupplied ?? 0),
      totalPurchaseValue: Number(stats.totalPurchaseValue ?? 0),
      lastSupplyDate: stats.lastSupplyDate ? String(stats.lastSupplyDate) : null,
    },
    analytics: {
      mostSuppliedProduct: '—',
      totalQuantitySupplied: Number(stats.totalQuantitySupplied ?? 0),
      totalPurchaseValue: Number(stats.totalPurchaseValue ?? 0),
      recentSupplies: [],
    },
  }
}

export function mapPurchase(dto: Record<string, unknown>) {
  const items = Array.isArray(dto.items)
    ? dto.items.map((item) => mapPurchaseItem(item as Record<string, unknown>))
    : []

  return {
    id: String(dto.id),
    purchaseNumber: String(dto.purchaseNumber ?? ''),
    supplierId: String(dto.supplierId),
    supplierName: String(dto.supplierName ?? ''),
    warehouseId: String(dto.warehouseId),
    warehouseName: String(dto.warehouseName ?? ''),
    purchaseDate: toIsoDate(dto.purchaseDate as string),
    invoiceNumber: String(dto.invoiceNumber ?? ''),
    subtotal: Number(dto.subtotal ?? dto.totalAmount ?? 0),
    taxAmount: Number(dto.taxAmount ?? 0),
    totalAmount: Number(dto.totalAmount ?? 0),
    paymentStatus: 'unpaid' as const,
    purchaseStatus: fromPurchaseStatus(dto.status ?? dto.purchaseStatus ?? 1, items),
    notes: String(dto.notes ?? ''),
    createdBy: String(dto.createdBy ?? dto.userId ?? ''),
    createdByName: String(dto.createdByName ?? dto.userName ?? ''),
    createdAt: toIsoDate(dto.createdAt as string),
    updatedAt: toIsoDate((dto.updatedAt ?? dto.createdAt) as string),
    items,
  }
}

export function mapPurchaseItem(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    purchaseId: String(dto.purchaseId ?? ''),
    productId: String(dto.productId ?? ''),
    productName: String(dto.productName ?? ''),
    productVariantId: String(dto.productVariantId),
    variantName: String(dto.variantName ?? ''),
    quantity: Number(dto.quantity ?? 0),
    receivedQuantity: Number(dto.receivedQuantity ?? 0),
    costPrice: Number(dto.costPrice ?? 0),
    totalCost: Number(dto.totalCost ?? 0),
    section: String(dto.section ?? 'MAIN'),
    rack: String(dto.rack ?? 'R1'),
    bin: String(dto.bin ?? 'B1'),
  }
}

export function mapWarehouseListItem(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    warehouseCode: String(dto.warehouseCode ?? ''),
    warehouseName: String(dto.warehouseName ?? ''),
    description: String(dto.description ?? ''),
    totalProducts: Number(dto.totalProducts ?? 0),
    totalStockQuantity: Number(dto.totalStockQuantity ?? 0),
    status: fromEntityStatus(dto.status ?? 1),
  }
}

export function mapWarehouseDetail(dto: Record<string, unknown>) {
  const base = mapWarehouseListItem(dto)
  return {
    ...base,
    address: String(dto.address ?? ''),
    manager: String(dto.manager ?? ''),
    inventoryValue: Number(dto.inventoryValue ?? 0),
    createdAt: toIsoDate(dto.createdAt as string),
    updatedAt: toIsoDate((dto.updatedAt ?? dto.createdAt) as string),
  }
}

export function mapWarehouseStockRecord(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    warehouseId: String(dto.warehouseId),
    warehouseName: String(dto.warehouseName ?? ''),
    locationId: String(dto.locationId ?? dto.id ?? ''),
    section: String(dto.section ?? ''),
    rack: String(dto.rack ?? ''),
    bin: String(dto.bin ?? ''),
    productId: String(dto.productId),
    productName: String(dto.productName ?? ''),
    productVariantId: String(dto.productVariantId),
    variantName: String(dto.variantName ?? ''),
    brand: String(dto.brand ?? ''),
    color: String(dto.color ?? dto.variantName ?? ''),
    categoryId: String(dto.categoryId ?? ''),
    quantity: Number(dto.quantity ?? 0),
    unitCost: Number(dto.unitCost ?? 0),
  }
}

export function mapWarehouseTransfer(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    transferNumber: String(dto.transferNumber ?? ''),
    productId: String(dto.productId ?? ''),
    productName: String(dto.productName ?? ''),
    productVariantId: String(dto.productVariantId),
    variantName: String(dto.variantName ?? ''),
    fromWarehouseId: String(dto.fromWarehouseId),
    fromWarehouseName: String(dto.fromWarehouseName ?? ''),
    toWarehouseId: String(dto.toWarehouseId),
    toWarehouseName: String(dto.toWarehouseName ?? ''),
    quantity: Number(dto.quantity ?? 0),
    reason: String(dto.reason ?? ''),
    notes: String(dto.notes ?? ''),
    userId: String(dto.userId ?? ''),
    userName: String(dto.userName ?? ''),
    createdAt: toIsoDate(dto.createdAt as string),
  }
}

export function mapProductAvailability(dto: Record<string, unknown>) {
  const results = Array.isArray(dto.results)
    ? dto.results.map((item) => {
        const entry = item as Record<string, unknown>
        const locations = Array.isArray(entry.locations)
          ? entry.locations.map((location) => {
              const loc = location as Record<string, unknown>
              return {
                warehouseId: String(loc.warehouseId),
                warehouseName: String(loc.warehouseName ?? loc.warehouse ?? ''),
                quantity: Number(loc.quantity ?? 0),
              }
            })
          : []

        return {
          productId: String(entry.productId),
          productName: String(entry.productName ?? ''),
          brand: String(entry.brand ?? ''),
          color: String(entry.variantName ?? entry.color ?? ''),
          variantName: String(entry.variantName ?? ''),
          productVariantId: String(entry.productVariantId),
          locations,
          totalQuantity: Number(entry.totalQuantity ?? 0),
        }
      })
    : []

  return {
    status: String(dto.status ?? 'not_found') as 'available' | 'out_of_stock' | 'not_found',
    message: String(dto.message ?? ''),
    query: String(dto.query ?? ''),
    results,
    catalogMatches: Array.isArray(dto.catalogMatches)
      ? dto.catalogMatches.map((item) => {
          const match = item as Record<string, unknown>
          return {
            productId: String(match.productId),
            productName: String(match.productName ?? ''),
            brand: String(match.brand ?? ''),
            color: String(match.color ?? match.variantName ?? ''),
            productVariantId: String(match.productVariantId),
          }
        })
      : undefined,
  }
}

export function mapSettingsBranch(dto: Record<string, unknown>) {
  return {
    id: String(dto.id),
    branchName: String(dto.branchName ?? ''),
    branchCode: String(dto.branchCode ?? ''),
    address: String(dto.address ?? ''),
    phoneNumber: String(dto.phoneNumber ?? ''),
    manager: String(dto.manager ?? ''),
    status: fromEntityStatus(dto.status ?? 1),
    createdAt: toIsoDate(dto.createdAt as string),
  }
}

export function mapServiceListItem(dto: Record<string, unknown>) {
  const isActive = Boolean(dto.isActive ?? true)
  return {
    id: String(dto.id),
    serviceCode: String(dto.serviceCode ?? ''),
    serviceName: String(dto.serviceName ?? ''),
    categoryId: String(dto.categoryId ?? 'general'),
    categoryName: String(dto.categoryName ?? 'General'),
    description: String(dto.description ?? ''),
    standardPrice: Number(dto.price ?? dto.standardPrice ?? 0),
    status: (isActive ? 'active' : 'inactive') as 'active' | 'inactive',
    createdAt: toIsoDate(dto.createdAt as string),
  }
}

export function mapServiceJob(dto: Record<string, unknown>) {
  const createdAt = toIsoDate(dto.createdAt as string)
  const completedAt = dto.completedAt ? toIsoDate(dto.completedAt as string) : null

  return {
    id: String(dto.id),
    jobNumber: String(dto.jobNumber ?? ''),
    customerId: String(dto.customerId ?? ''),
    customerName: String(dto.customerName ?? 'Walk-In Customer'),
    serviceId: String(dto.serviceId),
    serviceName: String(dto.serviceName ?? ''),
    technicianId: String(dto.assignedUserId ?? dto.technicianId ?? ''),
    technician: String(dto.assignedUserName ?? dto.technician ?? ''),
    serviceDate: toIsoDate((dto.serviceDate ?? dto.createdAt) as string),
    expectedCompletionDate: toIsoDate(
      (dto.expectedCompletionDate ?? dto.createdAt) as string,
    ),
    completionDate: completedAt,
    status: fromServiceJobStatus(dto.status ?? 1),
    amount: Number(dto.price ?? dto.amount ?? 0),
    notes: String(dto.notes ?? ''),
    createdAt,
    updatedAt: toIsoDate((dto.updatedAt ?? dto.createdAt) as string),
  }
}

export function mapServiceJobDetail(dto: Record<string, unknown>) {
  const base = mapServiceJob(dto)
  return {
    ...base,
    serviceCode: String(dto.serviceCode ?? ''),
    categoryName: String(dto.categoryName ?? 'General'),
    customerPhone: String(dto.customerPhone ?? ''),
    customerEmail: String(dto.customerEmail ?? ''),
  }
}

export function mapReportChartPoint(dto: Record<string, unknown>) {
  return {
    label: String(dto.label ?? ''),
    value: Number(dto.value ?? 0),
    secondaryValue:
      dto.secondaryValue === undefined || dto.secondaryValue === null
        ? undefined
        : Number(dto.secondaryValue),
  }
}
