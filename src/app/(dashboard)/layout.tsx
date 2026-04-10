'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/features/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userEmail={user.email ?? ''}
        displayName={profile?.display_name ?? user.email ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}