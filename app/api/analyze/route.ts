
import Groq from 'groq-sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type CoachScores = {
  clarity: number
  fluency: number
  confidence: number
  structure: number
  relevance: number
}

type CoachFeedbackItem = {
  title: string
  explanation: string
  technique: string
}

type CoachResult = {
  transcript: string
  score: number
  encouragement: string
  feedback: CoachFeedbackItem[]
  scores: CoachScores
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isCoachResult(value: unknown): value is CoachResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<CoachResult>
  return (
    typeof result.transcript === 'string' &&
    typeof result.score === 'number' &&
    typeof result.encouragement === 'string' &&
    Array.isArray(result.feedback) &&
    !!result.scores &&
    typeof result.scores.clarity === 'number' &&
    typeof result.scores.fluency === 'number' &&
    typeof result.scores.confidence === 'number' &&
    typeof result.scores.structure === 'number' &&
    typeof result.scores.relevance === 'number'
  )
}

async function findOrCreateScenario(
  supabase: SupabaseClient,
  details: {
    slug: string
    title: string
    prompt: string
    track: string
    level: string
    duration: number
  }
) {
  if (!details.slug) return null

  const { data, error } = await supabase
    .from('scenarios')
    .upsert(
      {
        slug: details.slug,
        title: details.title,
        description: details.prompt,
        category: details.track,
        track: details.track,
        difficulty: details.level,
        time_limit_sec: details.duration,
        is_seed: true,
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('Scenario save error:', error.message)
    return null
  }

  return data
}

async function updateScenarioCompletion(
  supabase: SupabaseClient,
  userId: string,
  scenarioId: string,
  score: number
) {
  const { data: existing, error } = await supabase
    .from('scenario_completions')
    .select('id, best_score, total_attempts')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .maybeSingle()

  if (error) {
    console.error('Scenario completion lookup error:', error.message)
    return
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('scenario_completions')
      .update({
        best_score: Math.max(existing.best_score ?? 0, score),
        total_attempts: (existing.total_attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateError) console.error('Scenario completion update error:', updateError.message)
    return
  }

  const { error: insertError } = await supabase.from('scenario_completions').insert({
    user_id: userId,
    scenario_id: scenarioId,
    best_score: score,
    total_attempts: 1,
  })

  if (insertError) console.error('Scenario completion insert error:', insertError.message)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI feedback is not configured yet. Add GROQ_API_KEY to enable coaching.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audio = formData.get('audio')
    const scenario = getFormValue(formData, 'scenario')
    const scenarioSlug = getFormValue(formData, 'scenarioId')
    const scenarioTitle = getFormValue(formData, 'scenarioTitle') || 'Practice Session'
    const scenarioTrack = getFormValue(formData, 'scenarioTrack') || 'practice'
    const scenarioLevel = getFormValue(formData, 'scenarioLevel') || 'Beginner'
    const scenarioDuration = Number(getFormValue(formData, 'scenarioDuration')) || 60

    if (!(audio instanceof Blob) || !scenario?.trim()) {
      return NextResponse.json({ error: 'Audio and scenario are required.' }, { status: 400 })
    }

    // Step 1 — Speech to Text
    const file = new File([audio], 'recording.webm', { type: 'audio/webm' })
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      language: 'en',
    })

    const transcript = transcription.text

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.' },
        { status: 400 }
      )
    }

    // Step 2 — AI Feedback
    const feedback = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are a warm, encouraging communication coach for Indian students and professionals.

Your job is to analyze a spoken response and give specific, actionable feedback.

Rules:
- Be encouraging and kind — never harsh
- Give maximum 3 improvement points only
- Each point must have: title, explanation (1 sentence), technique (1 actionable fix)
- Also give a score from 0-100
- Return ONLY valid JSON — no markdown, no extra text

JSON format:
{
  "transcript": "what user said",
  "score": 72,
  "encouragement": "warm 1-2 sentence message",
  "feedback": [
    {
      "title": "Too many filler words",
      "explanation": "You said um 7 times which breaks listener focus.",
      "technique": "Replace each um with a 1-second confident pause."
    }
  ],
  "scores": {
    "clarity": 70,
    "fluency": 65,
    "confidence": 75,
    "structure": 72,
    "relevance": 78
  }
}`
        },
        {
          role: 'user',
          content: `Scenario: ${scenario}

Transcript: ${transcript}

Analyze this response and return JSON feedback.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const raw = feedback.choices[0]?.message?.content || '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const result: unknown = JSON.parse(clean)

    if (!isCoachResult(result)) {
      throw new Error('The coach returned an incomplete response. Please try again.')
    }

    // Step 3 — Save to Database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const savedScenario = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? await findOrCreateScenario(createAdminClient(), {
            slug: scenarioSlug,
            title: scenarioTitle,
            prompt: scenario,
            track: scenarioTrack,
            level: scenarioLevel,
            duration: scenarioDuration,
          })
        : null

      const { data: session } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          scenario_id: savedScenario?.id ?? null,
          status: 'complete',
          transcript: result.transcript,
        })
        .select()
        .single()

      if (session) {
        await supabase.from('scores').insert({
          session_id: session.id,
          user_id: user.id,
          clarity: result.scores.clarity,
          fluency: result.scores.fluency,
          confidence: result.scores.confidence,
          structure: result.scores.structure,
          relevance: result.scores.relevance,
          composite: result.score,
        })

        if (Array.isArray(result.feedback) && result.feedback.length > 0) {
          const feedbackRows = result.feedback.map(
            (
              item: { title: string; explanation: string; technique: string },
              index: number
            ) => ({
              session_id: session.id,
              user_id: user.id,
              rank: index + 1,
              issue_title: item.title,
              explanation: item.explanation,
              technique: item.technique,
              was_shown: true,
              is_resolved: false,
            })
          )

          const { error: feedbackError } = await supabase
            .from('feedback_items')
            .insert(feedbackRows)

          if (feedbackError) {
            console.error('Feedback save error:', feedbackError.message)
          }
        }

        if (savedScenario?.id) {
          await updateScenarioCompletion(supabase, user.id, savedScenario.id, result.score)
        }

        const today = new Date().toISOString().split('T')[0]
        const { data: streak } = await supabase
          .from('streaks')
          .select()
          .eq('user_id', user.id)
          .single()

        if (streak) {
          const lastDate = streak.last_active_date
          const isConsecutive =
            lastDate ===
            new Date(Date.now() - 86400000).toISOString().split('T')[0]

          await supabase.from('streaks').update({
            current_streak: isConsecutive ? streak.current_streak + 1 : 1,
            longest_streak: Math.max(
              streak.longest_streak,
              isConsecutive ? streak.current_streak + 1 : 1
            ),
            last_active_date: today,
          }).eq('user_id', user.id)
        } else {
          await supabase.from('streaks').insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today,
          })
        }
      }
    }

    return NextResponse.json({ success: true, ...result })

  } catch (error: unknown) {
    console.error('Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unable to analyse this recording. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
