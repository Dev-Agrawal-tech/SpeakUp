import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * POST /api/attempts
 * Saves a user's speaking attempt (transcript + metadata) to the database.
 * No AI analysis yet — just logs the raw transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized. Please log in first.', 401)
    }

    const body = await request.json()
    const { scenarioId, transcript, durationSeconds } = body

    if (!scenarioId || typeof scenarioId !== 'string') {
      return errorResponse('scenarioId is required.', 400)
    }
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 5) {
      return errorResponse('Transcript must be at least 5 characters.', 400)
    }

    // Create a session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        scenario_id: scenarioId,
        transcript: transcript.trim(),
        duration_seconds: durationSeconds ?? null,
        status: 'complete',
      })
      .select('id')
      .single()

    if (sessionError) {
      console.error('Session insert error:', sessionError)

      // Fallback: if sessions table doesn't exist or has different schema,
      // try inserting into user_attempts table
      const { data: attempt, error: attemptError } = await supabase
        .from('user_attempts')
        .insert({
          user_id: user.id,
          scenario_id: scenarioId,
          transcript: transcript.trim(),
          duration_seconds: durationSeconds ?? null,
          score: 0,
        })
        .select('id')
        .single()

      if (attemptError) {
        console.error('Attempt insert error:', attemptError)
        return errorResponse('Failed to save attempt. Database error.', 500)
      }

      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        score: 0,
        message: 'Attempt saved successfully. AI feedback coming soon!',
      })
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      score: 0,
      message: 'Attempt saved successfully. AI feedback coming soon!',
    })

  } catch (error: unknown) {
    console.error('Attempts API error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return errorResponse(message, 500)
  }
}

/**
 * GET /api/attempts
 * Returns the authenticated user's recent attempts.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Try sessions table first
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, scenario_id, transcript, status, duration_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // Fallback to user_attempts
      const { data: attempts, error: attError } = await supabase
        .from('user_attempts')
        .select('id, scenario_id, transcript, score, duration_seconds, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (attError) {
        return errorResponse('Failed to fetch attempts.', 500)
      }

      return NextResponse.json({ attempts })
    }

    return NextResponse.json({ attempts: sessions })

  } catch (error: unknown) {
    console.error('GET attempts error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return errorResponse(message, 500)
  }
}
