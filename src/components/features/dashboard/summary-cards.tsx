import { createClient } from '@/lib/supabase/server'

interface SummaryData {
  totalSpent: number
  transactionCount: number
  topCategory: string | null
  topCategoryPercent: number
  dailyAverage: number
  lastMonthTotal: number
}

async function getDashboardSummary(userId: string): Promise<SummaryData> {
  const supabase = await createClient()
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const { data: thisMonth } = await supabase
    .from('expenses')
    .select('amount, categories(name)')
    .eq('user_id', userId)
    .gte('date', firstOfMonth)

  const { data: lastMonth } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', firstOfLastMonth)
    .lte('date', lastOfLastMonth)

  const totalSpent = thisMonth?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
  const lastMonthTotal = lastMonth?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
  const transactionCount = thisMonth?.length ?? 0
  const dailyAverage = daysInMonth > 0 ? totalSpent / daysInMonth : 0

  // Find top category
  const categoryTotals: Record<string, number> = {}
  thisMonth?.forEach((e) => {
    const name = (e.categories as { name: string } | null)?.name ?? 'Other'
    categoryTotals[name] = (categoryTotals[name] ?? 0) + Number(e.amount)
  })

  let topCategory: string | null = null
  let topAmount = 0
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topAmount) { topAmount = amt; topCategory = cat }
  })

  const topCategoryPercent = totalSpent > 0 ? Math.round((topAmount / totalSpent) * 100) : 0

  return { totalSpent, transactionCount, topCategory, topCategoryPercent, dailyAverage, lastMonthTotal }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default async function SummaryCards({ userId }: { userId: string }) {
  const { totalSpent, transactionCount, topCategory, topCategoryPercent, dailyAverage, lastMonthTotal } =
    await getDashboardSummary(userId)

  const monthChange = lastMonthTotal > 0
    ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100
    : null

  const cards = [
    {
      label: 'Spent this month',
      value: formatCurrency(totalSpent),
      sub: monthChange !== null
        ? `${monthChange >= 0 ? '+' : ''}${monthChange.toFixed(1)}% vs last month`
        : 'No data last month',
      subColor: monthChange !== null && monthChange > 0 ? 'text-red-500' : 'text-emerald-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      iconBg: 'bg-sky-100 text-sky-600',
    },
    {
      label: 'Transactions',
      value: transactionCount.toString(),
      sub: 'this month',
      subColor: 'text-slate-400',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Top category',
      value: topCategory ?? '—',
      sub: topCategory ? `${topCategoryPercent}% of total` : 'No expenses yet',
      subColor: 'text-slate-400',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      ),
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Daily average',
      value: formatCurrency(dailyAverage),
      sub: 'based on full month',
      subColor: 'text-slate-400',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      iconBg: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <p className="text-slate-500 text-sm font-medium mb-2">{card.label}</p>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {card.value}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <span className={`text-xs font-medium ${card.subColor}`}>{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
