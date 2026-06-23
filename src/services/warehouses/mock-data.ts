import type {
  Warehouse,
  WarehouseLocation,
  WarehouseStockRecord,
  WarehouseTransfer,
} from '@/features/warehouses/types'

export const WAREHOUSES_STORAGE_KEY = 'naknaa_warehouses_v1'
export const WAREHOUSE_LOCATIONS_STORAGE_KEY = 'naknaa_warehouse_locations_v1'
export const WAREHOUSE_STOCK_STORAGE_KEY = 'naknaa_warehouse_stock_v3'
export const WAREHOUSE_TRANSFERS_STORAGE_KEY = 'naknaa_warehouse_transfers_v2'
export const WAREHOUSE_CODE_COUNTER_KEY = 'naknaa_warehouse_code_counter_v1'
export const TRANSFER_NUMBER_COUNTER_KEY = 'naknaa_transfer_number_counter_v1'

export const SEED_WAREHOUSE_CODE_COUNTER = 4
export const SEED_TRANSFER_NUMBER_COUNTER = 0

export const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-chairman-down',
    warehouseCode: 'WH-001',
    warehouseName: 'Chairman Down',
    description: 'Ground floor storage for speakers and heavy equipment.',
    address: 'Chairman Block, Ground Floor',
    manager: 'Kwame Mensah',
    status: 'active',
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'wh-chairman-top',
    warehouseCode: 'WH-002',
    warehouseName: 'Chairman Top',
    description: 'Upper floor storage for instruments and accessories.',
    address: 'Chairman Block, Top Floor',
    manager: 'Ama Osei',
    status: 'active',
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'wh-nasoo',
    warehouseCode: 'WH-003',
    warehouseName: 'Nasoo',
    description: 'Nasoo warehouse for overflow and seasonal stock.',
    address: 'Nasoo Industrial Area',
    manager: 'Kojo Asante',
    status: 'active',
    createdAt: '2025-07-15T08:00:00.000Z',
    updatedAt: '2026-02-01T11:00:00.000Z',
  },
  {
    id: 'wh-masalachi',
    warehouseCode: 'WH-004',
    warehouseName: 'Masalachi',
    description: 'Masalachi storage for fast-moving retail items.',
    address: 'Masalachi Market Road',
    manager: 'Esi Boateng',
    status: 'active',
    createdAt: '2025-08-20T08:00:00.000Z',
    updatedAt: '2026-02-20T14:00:00.000Z',
  },
]

export const SEED_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
  {
    id: 'loc-cd-spk-a01-b05',
    warehouseId: 'wh-chairman-down',
    warehouseName: 'Chairman Down',
    section: 'Speakers',
    rack: 'A-01',
    bin: 'B-05',
    description: 'Main speaker bay',
  },
  {
    id: 'loc-ct-spk-b03-a01',
    warehouseId: 'wh-chairman-top',
    warehouseName: 'Chairman Top',
    section: 'Speakers',
    rack: 'B-03',
    bin: 'A-01',
    description: 'Upper speaker storage',
  },
  {
    id: 'loc-ns-spk-c02-b01',
    warehouseId: 'wh-nasoo',
    warehouseName: 'Nasoo',
    section: 'Speakers',
    rack: 'C-02',
    bin: 'B-01',
    description: 'Nasoo speaker rack',
  },
  {
    id: 'loc-cd-gtr-d01-a02',
    warehouseId: 'wh-chairman-down',
    warehouseName: 'Chairman Down',
    section: 'Guitars',
    rack: 'D-01',
    bin: 'A-02',
    description: 'Guitar storage',
  },
  {
    id: 'loc-ms-kbd-e01-b03',
    warehouseId: 'wh-masalachi',
    warehouseName: 'Masalachi',
    section: 'Keyboards',
    rack: 'E-01',
    bin: 'B-03',
    description: 'Keyboard section',
  },
  {
    id: 'loc-ct-rcv-a01-b01',
    warehouseId: 'wh-chairman-top',
    warehouseName: 'Chairman Top',
    section: 'Receiving',
    rack: 'A-01',
    bin: 'B-01',
    description: 'Incoming transfer staging',
  },
]

export const SEED_WAREHOUSE_STOCK: WarehouseStockRecord[] = []

export const SEED_WAREHOUSE_TRANSFERS: WarehouseTransfer[] = []
