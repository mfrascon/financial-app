import { createClient } from '@/lib/supabase/server'

interface CategoryTotal {
  name: string
  color: string
  amount: number
  percent: number
}

async function getCategoryBreakdown(userId: string): Promise<CategoryTotal[]> {
  const supabase = await createClient()
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data } = await supabase
    .from('expenses')
    .select('amount, categories(name, color)')
    .eq('user_id', userId)
    .gte('date', firstOfMonth)

  if (!data || data.length === 0) return []

  const totals: Record<string, { amount: number; color: string }> = {}
  let grandTotal = 0

  data.forEach((e) => {
    const cat = e.categories as { name: string; color: string } | null
    const name = cat?.name ?? 'Other'
    const color = cat?.color ?? '#6b7280'
    const amount = Number(e.amount)
    totals[name] = { amount: (totals[name]?.amount ?? 0) + amount, color }
    grandTotal += amount
  })

  return Object.entries(totals)
    .map(([name, { amount, color }]) => ({
      name,
      color,
      amount,
      percent: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

export default async function CategoryBreakdown({ userId }: { userId: string }) {
  const categories = await getCategoryBreakdown(userId)

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
        Category breakdown
      </h3>

      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No data this month
        </div>
      ) : (
        <div className="flex-1 space-y-5">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700">{cat.name}</span>
                <span className="text-slate-400">{formatCurrency(cat.amount)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="/analytics"
        className="mt-8 text-[#006591] font-bold text-sm hover:underline"
      >
        Full category analysis →
      </a>
    </div>
  )
}
