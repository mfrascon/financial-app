// src/app/api/auth/token/route.ts — delete this after testing
// import { createClient } from '@/lib/supabase/server'
// import { NextResponse } from 'next/server'

// export async function GET() {
//   const supabase = await createClient()
//   const { data: { session } } = await supabase.auth.getSession()
//   return NextResponse.json({ token: session?.access_token })
// }