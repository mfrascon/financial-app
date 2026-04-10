'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyData {
  month: string
  amount: number
}

interface SpendingChartProps {
  data: MonthlyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-lg shadow-sm px-3 py-2">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function SpendingChart({ data }: SpendingChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No spending data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="amount" fill="#006591" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
