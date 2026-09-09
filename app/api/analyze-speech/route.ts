import Groq from 'groq-sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface FeedbackPoint {
  id?: string
  problemText: string
  solutionText: string
  status: 'unresolved' | 'resolved' | 'new'
}

export interface AnalyzeSpeechResult {
  score: number
  encouragement: string
  feedback: FeedbackPoint[]
  scores?: {
    clarity: number
    fluency: number
    confidence: number
    structure: number
    relevance: number
  }
}

interface GuestUnresolvedIssue {
  id?: string
  problemText?: string
  solutionText?: string
}

/**
 * POST /api/analyze-speech
 * Analyzes spoken response transcript against scenario prompt using AI.
 * Implements Progressive Improvement Rule:
 * - Checks past unresolved feedback items for the user & scenario.
 * - Asks AI to evaluate if past unresolved issues are fixed.
 * - Returns score and EXACTLY 3 major problems with actionable solutions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenarioId, scenarioTitle, scenarioPrompt, transcript, durationSeconds, guestUnresolvedIssues } = body

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 5) {
      return NextResponse.json(
        { error: 'Transcript is required and must be at least 5 characters long.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // 1. Fetch previous unresolved feedback items for this scenario if user is logged in
    let previousUnresolvedIssues: Array<{ id: string; problemText: string; solutionText: string }> = []
    if (userId && scenarioId) {
      // Query past attempts feedback
      const { data: pastAttempts } = await supabase
        .from('sessions')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (pastAttempts && pastAttempts.length > 0) {
        const sessionIds = pastAttempts.map((s) => s.id)
        const { data: pastFeedback } = await supabase
          .from('feedback_items')
          .select('id, issue_title, explanation, technique, is_resolved')
          .in('session_id', sessionIds)
          .eq('is_resolved', false)
          .limit(3)

        if (pastFeedback && pastFeedback.length > 0) {
          previousUnresolvedIssues = pastFeedback.map((f) => ({
            id: f.id,
            problemText: f.issue_title,
            solutionText: `${f.explanation} ${f.technique}`.trim(),
          }))
        }
      }

      // Fallback check in user_attempts / attempt_feedback tables
      if (previousUnresolvedIssues.length === 0) {
        const { data: pastUserAttempts } = await supabase
          .from('user_attempts')
          .select('id')
          .eq('user_id', userId)
          .eq('scenario_id', scenarioId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (pastUserAttempts && pastUserAttempts.length > 0) {
          const attemptIds = pastUserAttempts.map((a) => a.id)
          const { data: pastAttFeedback } = await supabase
            .from('attempt_feedback')
            .select('id, problem_text, solution_text, status')
            .in('attempt_id', attemptIds)
            .eq('status', 'unresolved')
            .limit(3)

          if (pastAttFeedback && pastAttFeedback.length > 0) {
            previousUnresolvedIssues = pastAttFeedback.map((f) => ({
              id: f.id,
              problemText: f.problem_text,
              solutionText: f.solution_text,
            }))
          }
        }
      }
    } else if (Array.isArray(guestUnresolvedIssues)) {
      previousUnresolvedIssues = (guestUnresolvedIssues as GuestUnresolvedIssue[]).map((issue) => ({
        id: issue.id || 'guest-issue',
        problemText: issue.problemText || '',
        solutionText: issue.solutionText || '',
      }))
    }

    // 2. Call AI (Groq LLaMA-3.3-70b or OpenAI/Claude fallback)
    const promptContext = `
Scenario Title: ${scenarioTitle || 'Communication Challenge'}
Scenario Situation/Prompt: ${scenarioPrompt || 'General speaking exercise'}
User Spoken Transcript: "${transcript.trim()}"

Previous Unresolved Issues from Past Attempt(s):
${previousUnresolvedIssues.length > 0
  ? JSON.stringify(previousUnresolvedIssues, null, 2)
  : 'None (This is the first attempt or all previous issues were resolved).'}`

    const systemInstructions = `You are SpeakUp AI — an elite, supportive communication coach for Indian students and founders.
Your core goal is to help users communicate ideas clearly, overcome hesitation, structure their thoughts, build confidence, and cover up speaking mistakes in English.

DO NOT focus on rigid school grammar or minor tense slips. Focus on:
1. Clarity & Flow (Did they explain their point clearly? Did they fumble or hesitate?)
2. Structure & Pitch (Did they use a hook, problem-solution format, or crisp answer?)
3. Confidence & Cover-up (How to cover up fumbles or pauses naturally without panic?)

PROGRESSIVE IMPROVEMENT RULES:
- Evaluate if any of the Previous Unresolved Issues have been fixed/improved in this attempt.
- If a previous issue IS fixed: Mark its status as 'resolved'. Then introduce 1 brand new issue.
- If a previous issue is NOT fixed: Keep it as 'unresolved' and provide a simplified, clearer cover-up strategy. Do NOT spam new issues until previous ones improve.
- You must return EXACTLY 3 feedback items in total (combining resolved/unresolved/new items).

RETURN ONLY VALID JSON matching this exact schema (no markdown formatting, no text before or after):
{
  "score": 75,
  "encouragement": "Warm 1-2 sentence message acknowledging their effort and key strength.",
  "feedback": [
    {
      "problemText": "Brief title of problem 1",
      "solutionText": "Clear, actionable 1-2 sentence step-by-step solution / cover-up technique.",
      "status": "unresolved"
    },
    {
      "problemText": "Brief title of problem 2",
      "solutionText": "Clear, actionable 1-2 sentence step-by-step solution / cover-up technique.",
      "status": "new"
    },
    {
      "problemText": "Brief title of problem 3",
      "solutionText": "Clear, actionable 1-2 sentence step-by-step solution / cover-up technique.",
      "status": "new"
    }
  ],
  "scores": {
    "clarity": 75,
    "fluency": 70,
    "confidence": 80,
    "structure": 72,
    "relevance": 78
  }
}`

    let aiResult: AnalyzeSpeechResult

    if (process.env.GROQ_API_KEY) {
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: promptContext }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      })

      const rawContent = completion.choices[0]?.message?.content || '{}'
      const cleanJson = rawContent.replace(/```json|```/g, '').trim()
      aiResult = JSON.parse(cleanJson)
    } else {
      // Fallback heuristic result if AI key is missing
      aiResult = {
        score: Math.min(85, Math.max(50, Math.floor(transcript.length / 4))),
        encouragement: 'Great effort putting your thoughts into words! Practice again to build smoother delivery.',
        feedback: [
          {
            problemText: 'Frequent pauses when explaining key details',
            solutionText: 'Use quick transition words like "Mainly because..." to buy 2 seconds to think.',
            status: 'new'
          },
          {
            problemText: 'Sentence structure felt slightly rushed at the end',
            solutionText: 'Slow down your final sentence and end with a firm tone.',
            status: 'new'
          },
          {
            problemText: 'Opening hook could be punchier',
            solutionText: 'Start directly with the core problem instead of "Um, so today..."',
            status: 'new'
          }
        ],
        scores: { clarity: 70, fluency: 65, confidence: 75, structure: 70, relevance: 75 }
      }
    }

    // Ensure feedback array has at least 3 items and valid statuses
    if (!Array.isArray(aiResult.feedback) || aiResult.feedback.length === 0) {
      aiResult.feedback = [
        { problemText: 'Initial hesitation', solutionText: 'Take a deep breath before speaking the first line.', status: 'new' },
        { problemText: 'Pacing control', solutionText: 'Pause for 1 second between main ideas.', status: 'new' },
        { problemText: 'Summary closing', solutionText: 'End with one sentence summarizing your main point.', status: 'new' }
      ]
    }
    aiResult.feedback = aiResult.feedback.slice(0, 3)

    // 3. Save to Database if user is authenticated
    if (userId) {
      let savedAttemptId: string | null = null

      // Save into sessions table
      const { data: sessionData } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          scenario_id: scenarioId,
          transcript: transcript.trim(),
          duration_seconds: durationSeconds ?? 60,
          status: 'complete',
        })
        .select('id')
        .single()

      if (sessionData) {
        savedAttemptId = sessionData.id

        // Insert score
        await supabase.from('scores').insert({
          session_id: sessionData.id,
          user_id: userId,
          composite: aiResult.score,
          clarity: aiResult.scores?.clarity ?? aiResult.score,
          fluency: aiResult.scores?.fluency ?? aiResult.score,
          confidence: aiResult.scores?.confidence ?? aiResult.score,
          structure: aiResult.scores?.structure ?? aiResult.score,
          relevance: aiResult.scores?.relevance ?? aiResult.score,
        })

        // Insert feedback items
        const feedbackRows = aiResult.feedback.map((item, index) => ({
          session_id: sessionData.id,
          user_id: userId,
          rank: index + 1,
          issue_title: item.problemText,
          explanation: item.problemText,
          technique: item.solutionText,
          was_shown: true,
          is_resolved: item.status === 'resolved',
        }))
        await supabase.from('feedback_items').insert(feedbackRows)
      }

      // Also save into user_attempts / attempt_feedback if those tables exist
      const { data: userAttData } = await supabase
        .from('user_attempts')
        .insert({
          user_id: userId,
          scenario_id: scenarioId,
          transcript: transcript.trim(),
          score: aiResult.score,
          duration_seconds: durationSeconds ?? 60,
        })
        .select('id')
        .single()

      if (userAttData) {
        if (!savedAttemptId) savedAttemptId = userAttData.id
        const attFbRows = aiResult.feedback.map((item) => ({
          attempt_id: userAttData.id,
          problem_text: item.problemText,
          solution_text: item.solutionText,
          status: item.status === 'resolved' ? 'resolved' : 'unresolved',
        }))
        await supabase.from('attempt_feedback').insert(attFbRows)
      }
    }

    return NextResponse.json({
      success: true,
      score: aiResult.score,
      encouragement: aiResult.encouragement,
      feedback: aiResult.feedback,
      scores: aiResult.scores,
    })

  } catch (err: unknown) {
    console.error('API /api/analyze-speech error:', err)
    const msg = err instanceof Error ? err.message : 'An error occurred during analysis.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
