import type { Branch, InventoryRecord, InventoryTransaction } from '@/features/inventory/types'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'

export const INVENTORY_STORAGE_KEY = 'naknaa_inventory_v1'
export const INVENTORY_TRANSACTIONS_KEY = 'naknaa_inventory_transactions_v1'
export const BRANCHES_STORAGE_KEY = 'naknaa_branches_v1'

export const SEED_BRANCHES: Branch[] = [
  { id: 'branch-main', name: 'NakNaa Main Store', code: 'MAIN', isActive: true },
  { id: 'branch-accra', name: 'Accra Branch', code: 'ACC', isActive: true },
  { id: 'branch-kumasi', name: 'Kumasi Branch', code: 'KUM', isActive: true },
]

function buildSeedInventory(): InventoryRecord[] {
  const records: InventoryRecord[] = []
  const timestamp = '2026-02-01T08:00:00.000Z'

  for (const variant of SEED_VARIANTS) {
    records.push({
      id: `inv-${variant.id}-main`,
      branchId: DEFAULT_BRANCH_ID,
      productVariantId: variant.id,
      quantity: variant.currentStock,
      minimumStockLevel: variant.minimumStock,
      lastUpdated: variant.updatedAt,
    })
  }

  const featuredVariants = [
    { variantId: 'var-jbl-bass', qty: 2 },
    { variantId: 'var-strat-black', qty: 1 },
    { variantId: 'var-psr-61', qty: 3 },
    { variantId: 'var-mixer-analog', qty: 2 },
  ]

  for (const item of featuredVariants) {
    const variant = SEED_VARIANTS.find((entry) => entry.id === item.variantId)
    if (!variant) continue

    records.push({
      id: `inv-${item.variantId}-accra`,
      branchId: 'branch-accra',
      productVariantId: item.variantId,
      quantity: item.qty,
      minimumStockLevel: variant.minimumStock,
      lastUpdated: timestamp,
    })
  }

  return records
}

export const SEED_INVENTORY: InventoryRecord[] = buildSeedInventory()

export const SEED_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'txn-001',
    inventoryId: 'inv-var-jbl-bass-main',
    branchId: 'branch-main',
    productId: 'prod-jbl-srx815',
    productVariantId: 'var-jbl-bass',
    productName: 'JBL SRX815',
    variantName: 'Bass',
    branchName: 'NakNaa Main Store',
    transactionType: 'stock_in',
    quantity: 4,
    previousQuantity: 0,
    newQuantity: 4,
    unitCost: 4200,
    supplier: 'JBL Ghana',
    notes: 'Initial stock receipt',
    userId: 'demo-admin',
    userName: 'NakNaa Admin',
    referenceNumber: 'INV-20260201-001',
    createdAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'txn-002',
    inventoryId: 'inv-var-strat-blue-main',
    branchId: 'branch-main',
    productId: 'prod-fender-strat',
    productVariantId: 'var-strat-blue',
    productName: 'Fender Stratocaster',
    variantName: 'Blue',
    branchName: 'NakNaa Main Store',
    transactionType: 'stock_out',
    quantity: 1,
    previousQuantity: 1,
    newQuantity: 0,
    reason: 'Damage',
    notes: 'Damaged during display setup',
    userId: 'demo-admin',
    userName: 'NakNaa Admin',
    referenceNumber: 'INV-20260202-014',
    createdAt: '2026-02-02T11:30:00.000Z',
  },
  {
    id: 'txn-003',
    inventoryId: 'inv-var-jbl-monitor-main',
    branchId: 'branch-main',
    productId: 'prod-jbl-srx815',
    productVariantId: 'var-jbl-monitor',
    productName: 'JBL SRX815',
    variantName: 'Monitor',
    branchName: 'NakNaa Main Store',
    transactionType: 'adjustment',
    quantity: 1,
    previousQuantity: 2,
    newQuantity: 1,
    reason: 'Cycle count correction',
    userId: 'demo-admin',
    userName: 'NakNaa Admin',
    referenceNumber: 'INV-20260203-008',
    createdAt: '2026-02-03T15:45:00.000Z',
  },
  {
    id: 'txn-004',
    inventoryId: 'inv-var-psr-61-accra',
    branchId: 'branch-accra',
    productId: 'prod-yamaha-psr',
    productVariantId: 'var-psr-61',
    productName: 'Yamaha PSR',
    variantName: '61 Keys',
    branchName: 'Accra Branch',
    transactionType: 'purchase',
    quantity: 3,
    previousQuantity: 0,
    newQuantity: 3,
    unitCost: 1800,
    supplier: 'Yamaha West Africa',
    userId: 'demo-admin',
    userName: 'NakNaa Admin',
    referenceNumber: 'INV-20260204-021',
    createdAt: '2026-02-04T10:15:00.000Z',
  },
]

export function getProductByVariantId(variantId: string) {
  const variant = SEED_VARIANTS.find((entry) => entry.id === variantId)
  if (!variant) return null
  const product = SEED_PRODUCTS.find((entry) => entry.id === variant.productId)
  return product ? { product, variant } : null
}
