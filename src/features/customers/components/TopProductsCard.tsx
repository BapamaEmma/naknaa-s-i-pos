import { TopPurchasedProducts } from '@/features/customers/components/TopPurchasedProducts'
import type { TopPurchasedProduct } from '@/features/customers/types'

interface TopProductsCardProps {
  products: TopPurchasedProduct[]
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  return <TopPurchasedProducts products={products} title="Top Products Purchased" />
}
