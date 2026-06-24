import type { Purchase, PurchaseItem, PurchaseOrder } from '@/features/purchases/types'

export const PURCHASES_STORAGE_KEY = 'naknaa_purchases_v1'
export const PURCHASE_ITEMS_STORAGE_KEY = 'naknaa_purchase_items_v1'
export const PURCHASE_ORDERS_STORAGE_KEY = 'naknaa_purchase_orders_v1'
export const PURCHASE_COUNTER_KEY = 'naknaa_purchase_counter_v1'
export const PURCHASE_ORDER_COUNTER_KEY = 'naknaa_purchase_order_counter_v1'

export const SEED_PURCHASE_COUNTER = 1
export const SEED_PURCHASE_ORDER_COUNTER = 1

const now = '2026-06-15T10:00:00.000Z'

export const SEED_PURCHASES: Purchase[] = [
  {
    id: 'pur-001',
    purchaseNumber: 'PUR-2026-000001',
    supplierId: 'sup-jbl-ghana',
    supplierName: 'JBL Ghana Ltd',
    warehouseId: 'wh-chairman-down',
    warehouseName: 'Chairman Down',
    purchaseDate: '2026-06-10',
    invoiceNumber: 'JBL-INV-4582',
    subtotal: 100_000,
    taxAmount: 15_000,
    totalAmount: 115_000,
    paymentStatus: 'partial',
    purchaseStatus: 'partially_received',
    notes: 'Initial JBL SRX815 speaker shipment.',
    createdBy: 'admin-001',
    createdByName: 'System Admin',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pur-002',
    purchaseNumber: 'PUR-2026-000002',
    supplierId: 'sup-yamaha-west',
    supplierName: 'Yamaha West Africa',
    warehouseId: 'wh-chairman-top',
    warehouseName: 'Chairman Top',
    purchaseDate: '2026-06-05',
    invoiceNumber: 'YMH-2026-112',
    subtotal: 45_000,
    taxAmount: 6750,
    totalAmount: 51_750,
    paymentStatus: 'paid',
    purchaseStatus: 'received',
    notes: 'Keyboard restock order.',
    createdBy: 'admin-001',
    createdByName: 'System Admin',
    createdAt: '2026-06-05T09:00:00.000Z',
    updatedAt: '2026-06-08T14:00:00.000Z',
  },
]

export const SEED_PURCHASE_ITEMS: PurchaseItem[] = [
  {
    id: 'pi-001',
    purchaseId: 'pur-001',
    productId: 'prod-jbl-srx815',
    productName: 'JBL SRX815',
    productVariantId: 'var-jbl-bass',
    variantName: 'Bass',
    quantity: 20,
    receivedQuantity: 12,
    costPrice: 3500,
    totalCost: 70_000,
    section: 'Speakers',
    rack: 'A-01',
    bin: 'B-05',
  },
  {
    id: 'pi-002',
    purchaseId: 'pur-001',
    productId: 'prod-jbl-srx815',
    productName: 'JBL SRX815',
    productVariantId: 'var-jbl-mid',
    variantName: 'Mid',
    quantity: 10,
    receivedQuantity: 0,
    costPrice: 3000,
    totalCost: 30_000,
    section: 'Speakers',
    rack: 'A-01',
    bin: 'B-05',
  },
]

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    orderNumber: 'PO-2026-000001',
    supplierId: 'sup-proaudio',
    supplierName: 'ProAudio Supplies',
    warehouseId: 'wh-nasoo',
    warehouseName: 'Nasoo',
    status: 'sent',
    notes: 'Mixer and cable order for Q3.',
    items: [
      {
        id: 'poi-001',
        productId: 'prod-soundcraft-mixer',
        productName: 'Soundcraft Mixer',
        productVariantId: 'var-mixer-analog',
        variantName: 'Analog',
        quantity: 5,
        costPrice: 8500,
      },
    ],
    createdBy: 'admin-001',
    createdByName: 'System Admin',
    createdAt: '2026-06-12T08:00:00.000Z',
  },
]
