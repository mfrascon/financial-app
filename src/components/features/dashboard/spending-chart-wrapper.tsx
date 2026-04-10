import { createClient } from '@/lib/supabase/server'
import SpendingChart from './spending-chart'

async function getMonthlySpending(userId: string) {
  const supabase = await createClient()
  const now = new Date()

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    .toISOString()
    .split('T')[0]

  const { data } = await supabase
    .from('expenses')
    .select('amount, date')
    .eq('user_id', userId)
    .gte('date', sixMonthsAgo)
    .order('date', { ascending: true })

  const monthTotals: Record<string, number> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('en-US', { month: 'short' })
    monthTotals[key] = 0
  }

  data?.forEach((e) => {
    const d = new Date(e.date)
    const key = d.toLocaleString('en-US', { month: 'short' })
    if (key in monthTotals) {
      monthTotals[key] = (monthTotals[key] ?? 0) + Number(e.amount)
    }
  })

  return Object.entries(monthTotals).map(([month, amount]) => ({
    month,
    amount: Math.round(amount * 100) / 100,
  }))
}

export default async function SpendingChartWrapper({ userId }: { userId: string }) {
  const data = await getMonthlySpending(userId)
  return <SpendingChart data={data} />
}
