import type { PaymentMethod } from '@/features/sales/types'

export type CustomerStatus = 'active' | 'inactive'

export interface Customer {
  id: string
  customerCode: string
  fullName: string
  phoneNumber: string
  email: string
  address: string
  city: string
  notes: string
  registrationDate: string
  status: CustomerStatus
}

export interface CustomerListItem extends Customer {
  totalPurchases: number
  totalAmountSpent: number
}

export interface CustomerStats {
  totalPurchases: number
  totalAmountSpent: number
  lastPurchaseDate: string | null
  averagePurchaseValue: number
}

export interface TopPurchasedProduct {
  rank: number
  productName: string
  variantName: string
  purchaseCount: number
}

export interface CustomerPurchase {
  id: string
  saleId: string
  receiptNumber: string
  saleDate: string
  itemsPurchased: number
  itemSummary: string
  paymentMethod: PaymentMethod
  totalAmount: number
}

export interface CustomerDetail extends Customer {
  stats: CustomerStats
  topProducts: TopPurchasedProduct[]
  recentPurchases: CustomerPurchase[]
}

export interface CustomerListFilters {
  search?: string
  status?: 'all' | CustomerStatus | 'new'
  page?: number
  limit?: number
}

export interface CustomerListResult {
  data: CustomerListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CustomerPurchaseFilters {
  dateFrom?: string
  dateTo?: string
  paymentMethod?: PaymentMethod | 'all'
  page?: number
  limit?: number
}

export interface CustomerPurchaseHistoryResult {
  purchases: CustomerPurchase[]
  summary: {
    totalPurchases: number
    totalRevenue: number
    averageOrderValue: number
  }
  topProducts: TopPurchasedProduct[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CustomerDashboardSummary {
  totalCustomers: number
  newCustomersThisMonth: number
  topCustomers: Array<{
    id: string
    customerCode: string
    fullName: string
    totalPurchases: number
  }>
  highestSpendingCustomers: Array<{
    id: string
    customerCode: string
    fullName: string
    totalAmountSpent: number
  }>
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'customerCode' | 'registrationDate'>

export type UpdateCustomerInput = Partial<CreateCustomerInput>

export interface CustomerOption {
  id: string
  name: string
  phone: string
}
