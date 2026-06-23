import type {
  CreateSupplierInput,
  CreateSupplierProductInput,
  Supplier,
  SupplierAnalytics,
  SupplierDetail,
  SupplierListFilters,
  SupplierListItem,
  SupplierListResult,
  SupplierOption,
  SupplierProduct,
  SupplierProductDetail,
  SupplierProductListFilters,
  SupplierProductListItem,
  SupplierProductListResult,
  SupplierStatistics,
  SupplierSupplyItemInput,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from '@/features/suppliers/types'
import type { Product, ProductVariant } from '@/features/products/types'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'
import {
  SEED_SUPPLIER_PRODUCTS,
  SEED_SUPPLIERS,
  SUPPLIER_PRODUCTS_STORAGE_KEY,
  SUPPLIERS_STORAGE_KEY,
} from '@/services/suppliers/mock-data'

function loadSuppliers(): Supplier[] {
  return readStorage(SUPPLIERS_STORAGE_KEY, SEED_SUPPLIERS).map((supplier) => ({
    ...supplier,
    storeName: supplier.storeName ?? '',
    suppliedToPerson: supplier.suppliedToPerson ?? '',
  }))
}

function saveSuppliers(suppliers: Supplier[]): void {
  writeStorage(SUPPLIERS_STORAGE_KEY, suppliers)
}

function loadSupplierProducts(): SupplierProduct[] {
  return readStorage(SUPPLIER_PRODUCTS_STORAGE_KEY, SEED_SUPPLIER_PRODUCTS)
}

function saveSupplierProducts(products: SupplierProduct[]): void {
  writeStorage(SUPPLIER_PRODUCTS_STORAGE_KEY, products)
}

function getSupplierProductsForSupplier(supplierId: string): SupplierProduct[] {
  return loadSupplierProducts().filter((entry) => entry.supplierId === supplierId)
}

function enrichProductListItem(entry: SupplierProduct): SupplierProductListItem {
  return {
    id: entry.id,
    supplierId: entry.supplierId,
    supplierName: entry.supplierName,
    productId: entry.productId,
    productName: entry.productName,
    productVariantId: entry.productVariantId,
    variantName: entry.variantName,
    quantitySupplied: entry.quantitySupplied,
    costPrice: entry.costPrice,
    totalCost: entry.quantitySupplied * entry.costPrice,
    dateSupplied: entry.dateSupplied,
    notes: entry.notes,
  }
}

function buildStatistics(supplierId: string): SupplierStatistics {
  const products = getSupplierProductsForSupplier(supplierId)
  const totalQuantitySupplied = products.reduce((sum, entry) => sum + entry.quantitySupplied, 0)
  const totalPurchaseValue = products.reduce(
    (sum, entry) => sum + entry.quantitySupplied * entry.costPrice,
    0,
  )
  const lastSupplyDate =
    products.length > 0
      ? products.sort(
          (a, b) => new Date(b.dateSupplied).getTime() - new Date(a.dateSupplied).getTime(),
        )[0].dateSupplied
      : null

  return {
    totalProductsSupplied: products.length,
    totalQuantitySupplied,
    totalPurchaseValue,
    lastSupplyDate,
  }
}

function buildAnalytics(supplierId: string): SupplierAnalytics {
  const products = getSupplierProductsForSupplier(supplierId)
  const stats = buildStatistics(supplierId)

  const quantityByProduct = new Map<string, number>()
  for (const entry of products) {
    const key = `${entry.productName} (${entry.variantName})`
    quantityByProduct.set(key, (quantityByProduct.get(key) ?? 0) + entry.quantitySupplied)
  }

  const mostSuppliedProduct =
    [...quantityByProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const recentSupplies = products
    .sort((a, b) => new Date(b.dateSupplied).getTime() - new Date(a.dateSupplied).getTime())
    .slice(0, 5)
    .map(enrichProductListItem)

  return {
    mostSuppliedProduct,
    totalQuantitySupplied: stats.totalQuantitySupplied,
    totalPurchaseValue: stats.totalPurchaseValue,
    recentSupplies,
  }
}

function enrichListItem(supplier: Supplier): SupplierListItem {
  const stats = buildStatistics(supplier.id)

  return {
    id: supplier.id,
    name: supplier.name,
    storeName: supplier.storeName,
    email: supplier.email,
    phoneNumber: supplier.phoneNumber,
    productCount: stats.totalProductsSupplied,
    totalPurchaseValue: stats.totalPurchaseValue,
    lastSupplyDate: stats.lastSupplyDate,
    isActive: supplier.isActive,
  }
}

function filterSuppliers(suppliers: Supplier[], filters: SupplierListFilters): Supplier[] {
  const search = filters.search?.trim().toLowerCase()

  return suppliers.filter((supplier) => {
    if (search) {
      const haystack = [
        supplier.name,
        supplier.storeName,
        supplier.suppliedToPerson,
        supplier.email,
        supplier.phoneNumber,
        supplier.city,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    if (filters.status === 'active' && !supplier.isActive) return false
    if (filters.status === 'inactive' && supplier.isActive) return false

    return true
  })
}

function filterSupplierProducts(
  products: SupplierProduct[],
  filters: SupplierProductListFilters,
): SupplierProduct[] {
  const search = filters.search?.trim().toLowerCase()

  return products.filter((entry) => {
    if (filters.supplierId && entry.supplierId !== filters.supplierId) {
      return false
    }

    if (search) {
      const haystack = [entry.productName, entry.variantName, entry.supplierName, entry.notes]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    return true
  })
}

function loadProducts(): Product[] {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants(): ProductVariant[] {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function saveVariants(variants: ProductVariant[]): void {
  writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
}

function resolveProductNames(productId: string, productVariantId: string) {
  const product = loadProducts().find((entry) => entry.id === productId)
  const variant = loadVariants().find((entry) => entry.id === productVariantId)

  if (!product || !variant || variant.productId !== productId) {
    throw new Error('Invalid product or variant selected.')
  }

  return {
    productName: product.name,
    variantName: variant.name,
  }
}

function resolveSupplyItem(input: SupplierSupplyItemInput) {
  const productName = input.productName.trim()
  const color = input.color?.trim() ?? ''
  const products = loadProducts()

  const product =
    products.find((entry) => entry.name.toLowerCase() === productName.toLowerCase()) ??
    products.find((entry) => productName.toLowerCase().includes(entry.name.toLowerCase()))

  if (!product) {
    throw new Error(
      `No product found for "${productName}". Add the product in Products first, then try again.`,
    )
  }

  const allVariants = loadVariants()
  const productVariants = allVariants.filter(
    (entry) => entry.productId === product.id && entry.isActive,
  )

  let variant = color
    ? productVariants.find((entry) => entry.name.toLowerCase() === color.toLowerCase())
    : productVariants[0]

  if (!variant) {
    const now = new Date().toISOString()
    variant = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: color || 'Standard',
      variantType: color ? 'Color' : 'Standard',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    allVariants.push(variant)
    saveVariants(allVariants)
  }

  return { product, variant }
}

function createSupplierProductRecord(
  supplier: Supplier,
  item: SupplierSupplyItemInput,
  dateSupplied: string,
): SupplierProduct {
  const { product, variant } = resolveSupplyItem(item)
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    supplierId: supplier.id,
    supplierName: supplier.name,
    productId: product.id,
    productName: product.name,
    productVariantId: variant.id,
    variantName: variant.name,
    quantitySupplied: item.quantity,
    costPrice: variant.costPrice,
    dateSupplied,
    notes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export const supplierService = {
  async getSuppliers(filters: SupplierListFilters = {}): Promise<SupplierListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterSuppliers(loadSuppliers(), filters).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichListItem),
      meta: { page, limit, total, totalPages },
    }
  },

  async getSupplierById(id: string): Promise<SupplierDetail> {
    await delay()

    const supplier = loadSuppliers().find((entry) => entry.id === id)
    if (!supplier) {
      throw new Error('Supplier not found.')
    }

    return {
      ...supplier,
      stats: buildStatistics(id),
      analytics: buildAnalytics(id),
    }
  },

  async getSupplierOptions(): Promise<SupplierOption[]> {
    await delay(100)

    return loadSuppliers()
      .filter((supplier) => supplier.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((supplier) => ({ id: supplier.id, name: supplier.name }))
  },

  async createSupplier(input: CreateSupplierInput): Promise<SupplierDetail> {
    await delay()

    const timestamp = new Date().toISOString()
    const supplier: Supplier = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      storeName: input.storeName.trim(),
      suppliedToPerson: input.suppliedToPerson.trim(),
      email: input.email.trim(),
      phoneNumber: input.phoneNumber.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      notes: input.notes.trim(),
      isActive: input.isActive,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const suppliers = loadSuppliers()
    suppliers.push(supplier)
    saveSuppliers(suppliers)

    if (input.items?.length) {
      const products = loadSupplierProducts()
      const dateSupplied = timestamp

      for (const item of input.items) {
        products.push(createSupplierProductRecord(supplier, item, dateSupplied))
      }

      saveSupplierProducts(products)
    }

    return supplierService.getSupplierById(supplier.id)
  },

  async updateSupplier(id: string, input: UpdateSupplierInput): Promise<SupplierDetail> {
    await delay()

    const suppliers = loadSuppliers()
    const index = suppliers.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('Supplier not found.')
    }

    const updated: Supplier = {
      ...suppliers[index],
      name: input.name.trim(),
      storeName: input.storeName.trim(),
      suppliedToPerson: input.suppliedToPerson.trim(),
      email: input.email.trim(),
      phoneNumber: input.phoneNumber.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      notes: input.notes.trim(),
      isActive: input.isActive,
      updatedAt: new Date().toISOString(),
    }

    suppliers[index] = updated
    saveSuppliers(suppliers)

    const products = loadSupplierProducts()
    let productsChanged = false

    for (let i = 0; i < products.length; i += 1) {
      if (products[i].supplierId === id) {
        products[i] = { ...products[i], supplierName: updated.name }
        productsChanged = true
      }
    }

    if (productsChanged) {
      saveSupplierProducts(products)
    }

    return supplierService.getSupplierById(id)
  },

  async deleteSupplier(id: string): Promise<void> {
    await delay()

    const products = getSupplierProductsForSupplier(id)
    if (products.length > 0) {
      throw new Error('Cannot delete a supplier with supplied products. Remove products first.')
    }

    saveSuppliers(loadSuppliers().filter((entry) => entry.id !== id))
  },

  async getSupplierProducts(
    filters: SupplierProductListFilters = {},
  ): Promise<SupplierProductListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterSupplierProducts(loadSupplierProducts(), filters).sort(
      (a, b) => new Date(b.dateSupplied).getTime() - new Date(a.dateSupplied).getTime(),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichProductListItem),
      meta: { page, limit, total, totalPages },
    }
  },

  async getSupplierProductById(id: string): Promise<SupplierProductDetail> {
    await delay()

    const entry = loadSupplierProducts().find((product) => product.id === id)
    if (!entry) {
      throw new Error('Supplier product record not found.')
    }

    return {
      ...entry,
      totalCost: entry.quantitySupplied * entry.costPrice,
    }
  },

  async createSupplierProduct(input: CreateSupplierProductInput): Promise<SupplierProductDetail> {
    await delay()

    const supplier = loadSuppliers().find((entry) => entry.id === input.supplierId)
    if (!supplier) {
      throw new Error('Invalid supplier selected.')
    }

    const { productName, variantName } = resolveProductNames(
      input.productId,
      input.productVariantId,
    )

    const timestamp = new Date().toISOString()
    const entry: SupplierProduct = {
      id: crypto.randomUUID(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: input.productId,
      productName,
      productVariantId: input.productVariantId,
      variantName,
      quantitySupplied: input.quantitySupplied,
      costPrice: input.costPrice,
      dateSupplied: input.dateSupplied,
      notes: input.notes.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const products = loadSupplierProducts()
    products.push(entry)
    saveSupplierProducts(products)

    return supplierService.getSupplierProductById(entry.id)
  },

  async updateSupplierProduct(
    id: string,
    input: UpdateSupplierProductInput,
  ): Promise<SupplierProductDetail> {
    await delay()

    const products = loadSupplierProducts()
    const index = products.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('Supplier product record not found.')
    }

    const { productName, variantName } = resolveProductNames(
      input.productId,
      input.productVariantId,
    )

    const updated: SupplierProduct = {
      ...products[index],
      productId: input.productId,
      productName,
      productVariantId: input.productVariantId,
      variantName,
      quantitySupplied: input.quantitySupplied,
      costPrice: input.costPrice,
      dateSupplied: input.dateSupplied,
      notes: input.notes.trim(),
      updatedAt: new Date().toISOString(),
    }

    products[index] = updated
    saveSupplierProducts(products)

    return supplierService.getSupplierProductById(id)
  },

  async deleteSupplierProduct(id: string): Promise<void> {
    await delay()
    saveSupplierProducts(loadSupplierProducts().filter((entry) => entry.id !== id))
  },
}
