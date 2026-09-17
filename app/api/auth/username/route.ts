import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string }
    const username = body.username?.trim().toLowerCase()

    if (!username) return NextResponse.json({ error: 'Username is required' }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .maybeSingle()

    if (error || !data?.email) return NextResponse.json({ error: 'Invalid login credentials' }, { status: 404 })
    return NextResponse.json({ email: data.email })
  } catch {
    return NextResponse.json({ error: 'Unable to process login' }, { status: 500 })
  }
}