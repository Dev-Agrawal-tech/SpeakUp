'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { SessionWithDetails } from '@/lib/types/session'

interface SpeakScoreChartProps {
  sessions: SessionWithDetails[]
}

function formatChartDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  })
}

export default function SpeakScoreChart({ sessions }: SpeakScoreChartProps) {
  const chartData = [...sessions]
    .filter((s) => s.score !== null)
    .reverse()
    .slice(-14)
    .map((s) => ({
      date: formatChartDate(s.created_at),
      score: s.score!.composite,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
        <p className="text-sm text-white/30">
          Complete sessions to see your trend
        </p>
      </div>
    )
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value}`, 'SpeakScore']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ fill: '#2563EB', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#3B82F6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
