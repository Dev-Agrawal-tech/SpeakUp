'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { SessionWithDetails } from '@/lib/types/session'

interface SessionCardProps {
  session: SessionWithDetails
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export default function SessionCard({ session }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const score = session.score?.composite
  const preview =
    session.transcript && session.transcript.length > 120
      ? `${session.transcript.slice(0, 120)}…`
      : session.transcript

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-white/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-4 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">
              {session.scenario_name}
            </p>
            <span className="text-xs text-white/30">·</span>
            <p className="text-xs text-white/40">{formatDate(session.created_at)}</p>
          </div>
          {preview && (
            <p className="text-xs leading-relaxed text-white/50 line-clamp-2">
              {preview}
            </p>
          )}
          {!expanded && session.feedback_items.length > 0 && (
            <p className="mt-2 text-xs text-blue-400/80">
              {session.feedback_items.length} feedback point
              {session.feedback_items.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {score !== undefined && score !== null ? (
            <div className="text-right">
              <div className={`text-2xl font-bold ${scoreColor(score)}`}>
                {score}
              </div>
              <div className="text-[10px] text-white/30">SpeakScore</div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-sm text-white/30">—</div>
              <div className="text-[10px] text-white/30">No score</div>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-white/10 px-4 pb-4 pt-3">
          {session.transcript && (
            <div>
              <p className="mb-2 text-xs font-medium text-white/40">
                Transcript
              </p>
              <p className="rounded-lg bg-white/[0.03] p-3 text-sm leading-relaxed text-white/70">
                {session.transcript}
              </p>
            </div>
          )}

          {session.feedback_items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/40">Feedback</p>
              {session.feedback_items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="mb-1 text-sm font-medium text-white">
                    {item.issue_title}
                  </p>
                  <p className="mb-2 text-xs leading-relaxed text-white/50">
                    {item.explanation}
                  </p>
                  <p className="text-xs text-blue-400">{item.technique}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30">
              No feedback saved for this session.
            </p>
          )}

          {session.score && (
            <div>
              <p className="mb-2 text-xs font-medium text-white/40">
                Score breakdown
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    ['Clarity', session.score.clarity],
                    ['Fluency', session.score.fluency],
                    ['Confidence', session.score.confidence],
                    ['Structure', session.score.structure],
                    ['Relevance', session.score.relevance],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-white/[0.03] px-3 py-2 text-center"
                  >
                    <div className="text-sm font-semibold text-white">{value}</div>
                    <div className="text-[10px] text-white/40">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
