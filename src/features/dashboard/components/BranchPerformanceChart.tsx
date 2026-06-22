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
import type { BranchPerformance } from '@/features/dashboard/types'
import { formatCurrency } from '@/lib/format'

interface BranchPerformanceChartProps {
  branches: BranchPerformance[]
}

export function BranchPerformanceChart({ branches }: BranchPerformanceChartProps) {
  const chartData = branches.map((branch) => ({
    name: branch.branchName.replace(' Branch', '').replace('NakNaa Main Store', 'Main'),
    sales: branch.salesAmount,
    transactions: branch.transactions,
  }))

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Branch Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)} />
              <Bar dataKey="sales" name="Sales Amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {branches.map((branch) => (
            <div key={branch.branchId} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{branch.branchName}</p>
              <p className="text-lg font-bold">{formatCurrency(branch.salesAmount)}</p>
              <p className="text-xs text-muted-foreground">{branch.transactions} transactions</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
