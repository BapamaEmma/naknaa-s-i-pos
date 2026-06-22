import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaymentMethodSlice } from '@/features/dashboard/types'
import { formatCurrency } from '@/lib/format'

const COLORS = ['#2563eb', '#10b981']

interface PaymentMethodChartProps {
  data: PaymentMethodSlice[]
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.method} className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">
                {item.percentage}% · {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
