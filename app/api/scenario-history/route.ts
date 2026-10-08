import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

interface ScoreRow {
  composite?: number | null
}

interface SessionFeedbackRow {
  id: string
  issue_title?: string | null
  explanation?: string | null
  technique?: string | null
  is_resolved?: boolean | null
}

/**
 * GET /api/scenario-history?scenarioId=founder-1
 * Returns past attempts for the user on a specific scenario with AI feedback and scores over time.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scenarioId = searchParams.get('scenarioId')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ attempts: [], authenticated: false })
    }

    // Query sessions with scores and feedback_items
    let query = supabase
      .from('sessions')
      .select(`
        id,
        scenario_id,
        transcript,
        created_at,
        scores (
          composite,
          clarity,
          fluency,
          confidence,
          structure,
          relevance
        ),
        feedback_items (
          id,
          issue_title,
          explanation,
          technique,
          is_resolved
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (scenarioId) {
      query = query.eq('scenario_id', scenarioId)
    }

    const { data: sessions, error } = await query.limit(20)

    if (!error && sessions && sessions.length > 0) {
      const formatted = sessions.map((s) => ({
        id: s.id,
        scenarioId: s.scenario_id,
        transcript: s.transcript,
        createdAt: s.created_at,
        score: Array.isArray(s.scores)
          ? (s.scores[0] as ScoreRow | undefined)?.composite ?? 0
          : (s.scores as ScoreRow | null)?.composite ?? 0,
        feedback: (s.feedback_items as SessionFeedbackRow[] || []).map((f) => ({
          id: f.id,
          problemText: f.issue_title,
          solutionText: `${f.explanation || ''} ${f.technique || ''}`.trim(),
          status: f.is_resolved ? 'resolved' : 'unresolved',
        })),
      }))

      return NextResponse.json({ attempts: formatted, authenticated: true })
    }

    return NextResponse.json({ attempts: [], authenticated: true })

  } catch (err: unknown) {
    console.error('Scenario history fetch error:', err)
    const msg = err instanceof Error ? err.message : 'Error fetching scenario history.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * DELETE /api/scenario-history?scenarioId=founder-1
 * Deletes all past attempts for the user on a specific scenario.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scenarioId = searchParams.get('scenarioId')

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Since sessions holds the foreign key and we don't have CASCADE set up, 
    // we need to delete child records first or they will be orphaned (if no fkey) 
    // actually, we should just delete the sessions and rely on the frontend to refresh.
    // Wait, let's delete them cleanly:
    
    // First, find all session IDs for this user & scenario
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('scenario_id', scenarioId)
      
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id)
      
      // Delete child records first
      await supabase.from('feedback_items').delete().in('session_id', sessionIds)
      await supabase.from('scores').delete().in('session_id', sessionIds)
      
      // Delete sessions
      const { error } = await supabase.from('sessions').delete().in('id', sessionIds)
      
      if (error) throw error
    }

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    console.error('Scenario history delete error:', err)
    const msg = err instanceof Error ? err.message : 'Error deleting scenario history.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
