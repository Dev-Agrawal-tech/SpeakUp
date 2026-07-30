import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        created_at,
        transcript,
        status,
        scores (
          composite,
          clarity,
          fluency,
          confidence,
          structure,
          relevance
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ sessions })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}