'use client'

import Link from 'next/link'
import SpeakScoreChart from '@/components/charts/SpeakScoreChart'
import SessionCard from '@/components/sessions/SessionCard'
import type { ProgressSummary } from '@/lib/types/session'

interface ProgressDashboardProps {
  progress: ProgressSummary
}

export default function ProgressDashboard({ progress }: ProgressDashboardProps) {
  const { speakScore, totalSessions, completedSessions, streak, averageScores, sessions } =
    progress

  const dimensions = averageScores
    ? [
        { label: 'Clarity', score: averageScores.clarity },
        { label: 'Fluency', score: averageScores.fluency },
        { label: 'Confidence', score: averageScores.confidence },
        { label: 'Structure', score: averageScores.structure },
        { label: 'Relevance', score: averageScores.relevance },
      ]
    : [
        { label: 'Clarity', score: 0 },
        { label: 'Fluency', score: 0 },
        { label: 'Confidence', score: 0 },
        { label: 'Structure', score: 0 },
        { label: 'Relevance', score: 0 },
      ]

  return (
    <>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="mb-2 text-xs text-white/40">Your SpeakScore</p>
        <div className="mb-1 text-6xl font-bold text-blue-400">
          {speakScore !== null ? speakScore : '--'}
        </div>
        <p className="text-xs text-white/30">
          {speakScore !== null
            ? 'Latest session score'
            : 'Complete a session to see your score'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="mb-1 text-2xl font-bold text-white">{totalSessions}</div>
          <div className="text-xs text-white/40">Sessions</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="mb-1 text-2xl font-bold text-white">
            {streak.current_streak} 🔥
          </div>
          <div className="text-xs text-white/40">Streak</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="mb-1 text-2xl font-bold text-white">{completedSessions}</div>
          <div className="text-xs text-white/40">Completed</div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-4 text-sm font-medium text-white/60">SpeakScore trend</p>
        <SpeakScoreChart sessions={sessions} />
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-4 text-sm font-medium text-white/60">Score breakdown</p>
        <div className="space-y-3">
          {dimensions.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-20 text-xs text-white/50">{item.label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-white/50">
                {averageScores ? item.score : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-4 text-sm font-medium text-white/60">Session history</p>

        {sessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-white/30">No sessions yet</p>
            <Link
              href="/practice"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm transition hover:bg-blue-500"
            >
              Start Practising →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
