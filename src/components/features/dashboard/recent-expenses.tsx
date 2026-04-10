import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Expense {
  id: string
  merchant: string
  amount: number
  date: string
  source: string
  categories: { name: string; color: string; icon: string } | null
}

async function getRecentExpenses(userId: string): Promise<Expense[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('expenses')
    .select('id, merchant, amount, date, source, categories(name, color, icon)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  return (data ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount),
    categories: e.categories as { name: string; color: string; icon: string } | null,
  }))
}

function getMerchantInitial(merchant: string) {
  return merchant.charAt(0).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function RecentExpenses({ userId }: { userId: string }) {
  const expenses = await getRecentExpenses(userId)

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Recent expenses
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">Last 5 transactions</p>
        </div>
        <Link
          href="/expenses"
          className="text-sm font-semibold text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          View all
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="px-8 py-12 text-center text-slate-400 text-sm">
          No expenses yet.{' '}
          <Link href="/expenses" className="text-[#006591] hover:underline font-medium">
            Add your first one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Merchant</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Source</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <Link href={`/expenses/${expense.id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0 group-hover:bg-sky-100 group-hover:text-sky-700 transition-colors">
                        {getMerchantInitial(expense.merchant)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-[#006591] transition-colors">
                          {expense.merchant}
                        </div>
                        <div className="text-[11px] text-slate-400">ID: #{expense.id.slice(0, 8)}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-8 py-5">
                    {expense.categories ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${expense.categories.color}20`,
                          color: expense.categories.color,
                        }}
                      >
                        {expense.categories.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Uncategorized
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        expense.source === 'receipt_scan'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {expense.source === 'receipt_scan' ? 'AI scan' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400">{formatDate(expense.date)}</td>
                  <td className="px-8 py-5 text-right font-bold text-slate-800 text-sm">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
