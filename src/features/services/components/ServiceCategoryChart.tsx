import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { ServiceCategoryPerformancePoint } from '@/features/services/types'
import { formatCurrency } from '@/lib/format'

interface ServiceCategoryChartProps {
  data?: ServiceCategoryPerformancePoint[]
  isLoading?: boolean
}

export function ServiceCategoryChart({ data = [], isLoading }: ServiceCategoryChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
