export interface FeedbackItem {
  id?: string
  issue_title: string
  explanation: string
  technique: string
  rank?: number
}

export interface SessionScore {
  composite: number
  clarity: number
  fluency: number
  confidence: number
  structure: number
  relevance: number
}

export interface SessionWithDetails {
  id: string
  transcript: string | null
  status: string
  created_at: string
  scenario_name: string
  score: SessionScore | null
  feedback_items: FeedbackItem[]
}

export interface UserStreak {
  current_streak: number
  longest_streak: number
  last_active_date: string | null
}

export interface ProgressSummary {
  speakScore: number | null
  totalSessions: number
  completedSessions: number
  streak: UserStreak
  averageScores: SessionScore | null
  sessions: SessionWithDetails[]
}
