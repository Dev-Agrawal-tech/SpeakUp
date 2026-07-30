import Groq from 'groq-sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob
    const scenario = formData.get('scenario') as string

    if (!audio) {
      return NextResponse.json({ error: 'No audio' }, { status: 400 })
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
      model: 'llama-3.3-70b-versatile',
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
    const result = JSON.parse(clean)

    // Step 3 — Save to Database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Session save karo
      const { data: session } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
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
              issue_type: 'general',
              issue_title: item.title,
              explanation: item.explanation,
              technique: item.technique,
              severity: 'medium',
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

        // Streak update karo
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

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}