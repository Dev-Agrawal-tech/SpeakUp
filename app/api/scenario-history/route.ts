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

interface AttemptFeedbackRow {
  id: string
  problem_text?: string | null
  solution_text?: string | null
  status?: string | null
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
        duration_seconds,
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

    // Fallback query from user_attempts & attempt_feedback
    let attQuery = supabase
      .from('user_attempts')
      .select(`
        id,
        scenario_id,
        transcript,
        score,
        duration_seconds,
        created_at,
        attempt_feedback (
          id,
          problem_text,
          solution_text,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (scenarioId) {
      attQuery = attQuery.eq('scenario_id', scenarioId)
    }

    const { data: userAttempts } = await attQuery.limit(20)

    const formattedUserAttempts = (userAttempts || []).map((a) => ({
      id: a.id,
      scenarioId: a.scenario_id,
      transcript: a.transcript,
      createdAt: a.created_at,
      score: a.score ?? 0,
      feedback: (a.attempt_feedback as AttemptFeedbackRow[] || []).map((f) => ({
        id: f.id,
        problemText: f.problem_text,
        solutionText: f.solution_text,
        status: f.status || 'unresolved',
      })),
    }))

    return NextResponse.json({ attempts: formattedUserAttempts, authenticated: true })

  } catch (err: unknown) {
    console.error('Scenario history fetch error:', err)
    const msg = err instanceof Error ? err.message : 'Error fetching scenario history.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
