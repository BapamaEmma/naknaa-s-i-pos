export { InventoryDashboardPage } from './pages/InventoryDashboardPage'
export { StockInPage } from './pages/StockInPage'
export { StockOutPage } from './pages/StockOutPage'
export { InventoryAdjustmentPage } from './pages/InventoryAdjustmentPage'
export { InventoryHistoryPage } from './pages/InventoryHistoryPage'
export { LowStockReportPage } from './pages/LowStockReportPage'

export {
  useInventory,
  useInventorySummary,
  useInventoryHistory,
  useLowStockInventory,
  useStockIn,
  useStockOut,
  useInventoryAdjustment,
  useInventoryBranches,
  useInventoryProducts,
  useInventoryVariants,
} from './hooks/use-inventory'

export { InventoryTable } from './components/InventoryTable'
export { InventoryFilters } from './components/InventoryFilters'
export { InventoryStatsCards } from './components/InventoryStatsCards'
export { StockInForm } from './components/StockInForm'
export { StockOutForm } from './components/StockOutForm'
export { AdjustmentForm } from './components/AdjustmentForm'
export { InventoryHistoryTable } from './components/InventoryHistoryTable'
export { LowStockTable } from './components/LowStockTable'

export { INVENTORY_ROUTES, INVENTORY_API_ENDPOINTS } from './constants'

export type {
  InventoryRecord,
  InventoryListItem,
  InventoryListFilters,
  InventoryDashboardSummary,
  InventoryTransaction,
  InventoryHistoryFilters,
  StockInInput,
  StockOutInput,
  InventoryAdjustmentInput,
} from './types'
