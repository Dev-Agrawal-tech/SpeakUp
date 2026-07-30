import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  FeedbackItem,
  ProgressSummary,
  SessionScore,
  SessionWithDetails,
  UserStreak,
} from '@/lib/types/session'

const DEFAULT_SCENARIO_NAME = 'Practice Session'

type RawScore = {
  composite: number
  clarity: number
  fluency: number
  confidence: number
  structure: number
  relevance: number
}

type RawFeedback = {
  id: string
  issue_title: string
  explanation: string
  technique: string
  rank: number | null
}

type RawSession = {
  id: string
  transcript: string | null
  status: string
  created_at: string
  scenarios: { title: string } | { title: string }[] | null
  scores: RawScore | RawScore[] | null
  feedback_items: RawFeedback | RawFeedback[] | null
}

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapScore(raw: RawScore | null): SessionScore | null {
  if (!raw) return null
  return {
    composite: raw.composite,
    clarity: raw.clarity,
    fluency: raw.fluency,
    confidence: raw.confidence,
    structure: raw.structure,
    relevance: raw.relevance,
  }
}

function mapFeedback(raw: RawFeedback | RawFeedback[] | null): FeedbackItem[] {
  const items = Array.isArray(raw) ? raw : raw ? [raw] : []
  return items
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .map(({ id, issue_title, explanation, technique, rank }) => ({
      id,
      issue_title,
      explanation,
      technique,
      rank: rank ?? undefined,
    }))
}

function mapSession(row: RawSession): SessionWithDetails {
  const scenario = firstOrNull(row.scenarios)
  return {
    id: row.id,
    transcript: row.transcript,
    status: row.status,
    created_at: row.created_at,
    scenario_name: scenario?.title ?? DEFAULT_SCENARIO_NAME,
    score: mapScore(firstOrNull(row.scores)),
    feedback_items: mapFeedback(row.feedback_items),
  }
}

function averageScores(sessions: SessionWithDetails[]): SessionScore | null {
  const scored = sessions.filter((s) => s.score !== null)
  if (scored.length === 0) return null

  const totals = scored.reduce(
    (acc, s) => {
      const score = s.score!
      return {
        composite: acc.composite + score.composite,
        clarity: acc.clarity + score.clarity,
        fluency: acc.fluency + score.fluency,
        confidence: acc.confidence + score.confidence,
        structure: acc.structure + score.structure,
        relevance: acc.relevance + score.relevance,
      }
    },
    { composite: 0, clarity: 0, fluency: 0, confidence: 0, structure: 0, relevance: 0 }
  )

  const count = scored.length
  return {
    composite: Math.round(totals.composite / count),
    clarity: Math.round(totals.clarity / count),
    fluency: Math.round(totals.fluency / count),
    confidence: Math.round(totals.confidence / count),
    structure: Math.round(totals.structure / count),
    relevance: Math.round(totals.relevance / count),
  }
}

async function fetchStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<UserStreak> {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return {
    current_streak: data?.current_streak ?? 0,
    longest_streak: data?.longest_streak ?? 0,
    last_active_date: data?.last_active_date ?? null,
  }
}

async function fetchSessionsWithDetails(
  supabase: SupabaseClient,
  userId: string
): Promise<SessionWithDetails[]> {
  const fullSelect = `
    id,
    transcript,
    status,
    created_at,
    scenarios ( title ),
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
      rank
    )
  `

  const withoutScenariosSelect = `
    id,
    transcript,
    status,
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
      rank
    )
  `

  const minimalSelect = `
    id,
    transcript,
    status,
    created_at,
    scores (
      composite,
      clarity,
      fluency,
      confidence,
      structure,
      relevance
    )
  `

  for (const select of [fullSelect, withoutScenariosSelect, minimalSelect]) {
    const { data, error } = await supabase
      .from('sessions')
      .select(select)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      return (data as unknown as RawSession[]).map(mapSession)
    }
  }

  throw new Error('Unable to fetch sessions')
}

export async function getUserProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressSummary> {
  const [sessions, streak] = await Promise.all([
    fetchSessionsWithDetails(supabase, userId),
    fetchStreak(supabase, userId),
  ])

  const completedSessions = sessions.filter((s) => s.status === 'complete').length
  const latestScore = sessions.find((s) => s.score)?.score?.composite ?? null
  const average = averageScores(sessions)

  return {
    speakScore: latestScore,
    totalSessions: sessions.length,
    completedSessions,
    streak,
    averageScores: average,
    sessions,
  }
}
