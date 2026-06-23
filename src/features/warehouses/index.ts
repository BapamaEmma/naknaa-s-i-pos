export { WarehouseListPage } from './pages/WarehouseListPage'
export { CreateWarehousePage } from './pages/CreateWarehousePage'
export { EditWarehousePage } from './pages/EditWarehousePage'
export { WarehouseDetailsPage } from './pages/WarehouseDetailsPage'
export { WarehouseLocationsPage } from './pages/WarehouseLocationsPage'
export { WarehouseStockEntryPage } from './pages/WarehouseStockEntryPage'
export { WarehouseTransfersPage } from './pages/WarehouseTransfersPage'

export {
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  useInventoryLocations,
  useProductLocator,
  useProductAvailabilitySearch,
  useTransfers,
  useCreateTransfer,
  useAddWarehouseStock,
  useWarehouseDashboard,
  useWarehouseInventoryReport,
} from './hooks/use-warehouses'

export { WarehouseTable } from './components/WarehouseTable'
export { WarehouseForm } from './components/WarehouseForm'
export { WarehouseStatsCards } from './components/WarehouseStatsCards'
export { LocationTable } from './components/LocationTable'
export { LocationForm } from './components/LocationForm'
export { ProductLocator } from './components/ProductLocator'
export { TransferForm } from './components/TransferForm'
export { TransferTable } from './components/TransferTable'
export { WarehouseStockEntryForm } from './components/WarehouseStockEntryForm'

export { WAREHOUSE_ROUTES, WAREHOUSE_API_ENDPOINTS } from './constants'
export type {
  Warehouse,
  WarehouseDetail,
  WarehouseListFilters,
  WarehouseLocation,
  WarehouseStockRecord,
  WarehouseTransfer,
  ProductLocatorResult,
  ProductAvailabilitySearchResult,
} from './types'
