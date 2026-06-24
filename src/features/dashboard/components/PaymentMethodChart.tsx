import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaymentMethodSlice } from '@/features/dashboard/types'
import { formatCurrency } from '@/lib/format'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4']

interface PaymentMethodChartProps {
  data: PaymentMethodSlice[]
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  return (
    <Card className="dashboard-card h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
        <p className="text-sm text-muted-foreground">Sales split by payment method</p>
      </CardHeader>
      <CardContent>
        <div className="mx-auto h-56 w-full max-w-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={4}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          {data.map((item, index) => (
            <div key={item.method} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="ml-auto font-medium">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
