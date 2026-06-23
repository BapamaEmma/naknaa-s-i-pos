import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import type { DashboardData, SalesChartPeriod } from '@/features/dashboard/types'
import { formatCurrency } from '@/lib/format'

interface SalesChartProps {
  data: DashboardData['salesChart']
}

const periodOptions: { value: SalesChartPeriod; label: string }[] = [
  { value: 'daily', label: '7 Days' },
  { value: 'weekly', label: '4 Weeks' },
  { value: 'monthly', label: '6 Months' },
]

export function SalesChart({ data }: SalesChartProps) {
  const [period, setPeriod] = useState<SalesChartPeriod>('monthly')
  const chartData = data[period].map((point) => ({
    ...point,
    purchases: Math.round(point.sales * 0.62),
    target: Math.round(point.sales * 1.08),
  }))

  return (
    <Card className="dashboard-card border-0 shadow-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Sales & Purchases</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Performance across your selected period</p>
        </div>
        <Select
          value={period}
          onChange={(event) => setPeriod(event.target.value as SalesChartPeriod)}
          className="h-9 w-full max-w-[140px] rounded-lg border-border/70 bg-muted/40 text-sm sm:w-auto"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                formatter={(value, name) => {
                  if (typeof value !== 'number') return value
                  if (name === 'Orders') return value
                  return formatCurrency(value)
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar
                dataKey="target"
                name="Sales Target"
                fill="#e2e8f0"
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="sales"
                name="Sales"
                fill="url(#salesGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="purchases"
                name="Purchases"
                fill="url(#purchaseGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
