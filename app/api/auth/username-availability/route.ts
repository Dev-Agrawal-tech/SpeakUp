import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string }
    const username = body.username?.trim().toLowerCase()

    if (!username) return NextResponse.json({ available: false }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (error) return NextResponse.json({ available: false }, { status: 500 })
    return NextResponse.json({ available: !data })
  } catch {
    return NextResponse.json({ available: false }, { status: 500 })
  }
}