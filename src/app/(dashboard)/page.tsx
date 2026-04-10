import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Dashboard
      </h1>
      <p className="text-slate-500 mb-8">
        Logged in as {user.email}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Spent this month', value: '$0.00' },
          { label: 'Transactions', value: '0' },
          { label: 'Top category', value: '—' },
          { label: 'Daily average', value: '$0.00' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
          >
            <p className="text-slate-500 text-sm mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Recent expenses
        </h2>
        <p className="text-slate-400 text-sm">
          No expenses yet. Add your first one to get started.
        </p>
      </div>
    </div>
  )
}