import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SummaryCards from '@/components/features/dashboard/summary-cards'
import SpendingChartWrapper from '@/components/features/dashboard/spending-chart-wrapper'
import CategoryBreakdown from '@/components/features/dashboard/category-breakdown'
import RecentExpenses from '@/components/features/dashboard/recent-expenses'
import Link from 'next/link'

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm animate-pulse">
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
      <div className="h-7 bg-slate-100 rounded w-3/4 mb-4" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3 mb-8" />
      <div className="h-64 bg-slate-50 rounded" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-2" />
        <div className="h-3 bg-slate-50 rounded w-1/5" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-8 py-5 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg" />
          <div className="flex-1">
            <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
            <div className="h-2 bg-slate-50 rounded w-1/4" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const firstName = user.email?.split('@')[0] ?? 'there'
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="pt-10 pb-12 px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1
            className="text-4xl font-extrabold tracking-tight text-slate-800"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Overview
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {greeting}, {firstName}. Here's your financial snapshot for {monthYear}.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white text-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>This month</span>
          </div>
          <Link
            href="/expenses"
            className="bg-[#006591] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#00578a] transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add expense</span>
          </Link>
        </div>
      </div>

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards userId={user.id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3
              className="text-lg font-bold text-slate-800"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Spending over time
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006591] inline-block" />
              Last 6 months
            </div>
          </div>
          <Suspense fallback={<div className="h-64 bg-slate-50 rounded animate-pulse" />}>
            <SpendingChartWrapper userId={user.id} />
          </Suspense>
        </div>

        <div className="lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <CategoryBreakdown userId={user.id} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <RecentExpenses userId={user.id} />
      </Suspense>
    </div>
  )
}