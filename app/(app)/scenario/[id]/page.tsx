'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronLeft, Clock3, Mic, Square, Send,
  AlertCircle, CheckCircle2, Loader2, History,
  X, Sparkles, TrendingUp, RefreshCw
} from 'lucide-react'
import { getScenarioById } from '@/lib/scenarios/catalogue'

type ViewState = 'ready' | 'recording' | 'review' | 'submitting' | 'done'

interface FeedbackItem {
  id?: string
  problemText: string
  solutionText: string
  status: 'unresolved' | 'resolved' | 'new'
}

interface AnalysisResult {
  score: number
  encouragement: string
  feedback: FeedbackItem[]
  scores?: {
    clarity: number
    fluency: number
    confidence: number
    structure: number
    relevance: number
  }
}

interface AttemptHistoryItem {
  id: string
  scenarioId: string
  transcript: string
  createdAt: string
  score: number
  feedback: FeedbackItem[]
}

export default function ScenarioPage() {
  const params = useParams()
  const router = useRouter()
  const scenarioId = params.id as string
  const scenario = getScenarioById(scenarioId)

  const [viewState, setViewState] = useState<ViewState>('ready')
  const [timeLeft, setTimeLeft] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // Scenario History Drawer state
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyItems, setHistoryItems] = useState<AttemptHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (viewState === 'recording' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [viewState])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Load local history on mount to ensure instant responsiveness
  useEffect(() => {
    if (typeof window !== 'undefined' && scenarioId) {
      const stored = localStorage.getItem(`speakup_history_${scenarioId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setHistoryItems(parsed)
          }
        } catch (e) {
          console.error('Error parsing local history:', e)
        }
      }
    }
  }, [scenarioId])

  // Fetch History for drawer
  const fetchHistory = useCallback(async () => {
    if (!scenarioId) return
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/scenario-history?scenarioId=${encodeURIComponent(scenarioId)}`)
      const data = await res.json()
      if (data.authenticated && data.attempts) {
        setHistoryItems(data.attempts)
        if (typeof window !== 'undefined') {
          localStorage.setItem(`speakup_history_${scenarioId}`, JSON.stringify(data.attempts))
        }
      } else {
        // Fallback for guest users
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`speakup_history_${scenarioId}`)
          if (stored) {
            setHistoryItems(JSON.parse(stored))
          }
        }
      }
    } catch {
      // Fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`speakup_history_${scenarioId}`)
        if (stored) {
          try {
            setHistoryItems(JSON.parse(stored))
          } catch {}
        }
      }
    } finally {
      setLoadingHistory(false)
    }
  }, [scenarioId])

  const openHistoryDrawer = () => {
    setHistoryOpen(true)
    fetchHistory()
  }

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscript('')
      setInterimText('')
      setAnalysisResult(null)
      setTimeLeft(scenario?.duration ?? 60)

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      })
      streamRef.current = stream

      // Start MediaRecorder for audio capture
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.start(500)

      // Start Web Speech API for live transcript
      const SpeechRecognitionConstructor =
        (typeof window !== 'undefined' &&
          ((window as unknown as Record<string, unknown>).SpeechRecognition ||
            (window as unknown as Record<string, unknown>).webkitSpeechRecognition)) as (new () => SpeechRecognition) | undefined

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-IN'

        recognition.onresult = (event: any) => {
          let finalText = ''
          let interim = ''
          for (let i = 0; i < event.results.length; i++) {
            const r = event.results[i]
            if (r.isFinal) {
              finalText += r[0].transcript + ' '
            } else {
              interim += r[0].transcript
            }
          }
          if (finalText) setTranscript((prev) => prev + finalText)
          setInterimText(interim)
        }

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('Speech recognition error:', event.error)
          }
        }

        recognition.onend = () => {
          if (viewState === 'recording') {
            try { recognition.start() } catch {}
          }
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      setViewState('recording')
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permission in your browser settings.')
      } else {
        setError('Could not access your microphone. Please check your device.')
      }
    }
  }, [scenario])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setInterimText('')
    setViewState('review')
  }, [])

  // Submit to /api/analyze-speech
  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('No speech detected. Please try recording again.')
      setViewState('ready')
      return
    }

    setViewState('submitting')
    setError(null)

    // Extract unresolved issues from the latest attempt in history
    const lastAttempt = historyItems[0]
    const guestUnresolvedIssues = lastAttempt
      ? lastAttempt.feedback
          .filter((f) => f.status !== 'resolved')
          .map((f) => ({
            problemText: f.problemText,
            solutionText: f.solutionText,
          }))
      : []

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario?.id ?? scenarioId,
          scenarioTitle: scenario?.title,
          scenarioPrompt: scenario?.prompt,
          transcript: transcript.trim(),
          durationSeconds: (scenario?.duration ?? 60) - timeLeft,
          guestUnresolvedIssues,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to analyze speech. Please try again.')
        setViewState('review')
        return
      }

      setAnalysisResult(data)
      setViewState('done')

      // Build new attempt item to prepend immediately to history list and state
      const newAttempt: AttemptHistoryItem = {
        id: 'local-' + Date.now(),
        scenarioId: scenario?.id ?? scenarioId,
        transcript: transcript.trim(),
        createdAt: new Date().toISOString(),
        score: data.score,
        feedback: data.feedback || [],
      }

      setHistoryItems((prev) => {
        const updated = [newAttempt, ...prev]
        if (typeof window !== 'undefined') {
          localStorage.setItem(`speakup_history_${scenarioId}`, JSON.stringify(updated))
        }
        return updated
      })

    } catch {
      setError('Network error. Please check your connection and try again.')
      setViewState('review')
    }
  }

  const handleRetry = () => {
    setTranscript('')
    setInterimText('')
    setError(null)
    setAnalysisResult(null)
    setViewState('ready')
  }

  if (!scenario) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Scenario not found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    )
  }

  const levelColors: Record<string, string> = {
    Beginner: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
    Easy: 'text-sky-400 border-sky-500/25 bg-sky-500/10',
    Medium: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
    Hard: 'text-orange-400 border-orange-500/25 bg-orange-500/10',
    Expert: 'text-red-400 border-red-500/25 bg-red-500/10',
  }

  const timerPercent = scenario.duration > 0 ? (timeLeft / scenario.duration) * 100 : 0

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ─── Top Nav ─── */}
      <nav className="sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={openHistoryDrawer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition"
            >
              <History className="h-3.5 w-3.5 text-blue-400" /> History
            </button>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${levelColors[scenario.level]}`}>
              {scenario.level}
            </span>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left: Scenario Details */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#151d3a]/80 via-[#0f1528]/80 to-transparent p-6 sm:p-8">
            <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${scenario.accent} opacity-[.1] blur-3xl`} />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-2xl">{scenario.trackIcon}</span>
                <span className="flex items-center gap-1 text-xs text-white/35">
                  <Clock3 className="h-3.5 w-3.5" /> {scenario.duration}s time limit
                </span>
              </div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">
                Your speaking mission
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{scenario.title}</h1>
              <p className="text-sm leading-7 text-white/55">{scenario.prompt}</p>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className={`rounded-lg border px-3 py-1.5 text-[10px] font-medium ${levelColors[scenario.level]}`}>
                  {scenario.level}
                </span>
                <span className="rounded-lg bg-white/[0.05] border border-white/[0.06] px-3 py-1.5 text-[10px] text-white/40">
                  Focus on 3 issues
                </span>
                <span className="rounded-lg bg-white/[0.05] border border-white/[0.06] px-3 py-1.5 text-[10px] text-white/40">
                  Progressive retry
                </span>
              </div>
            </div>
          </div>

          {/* Right: Recorder / Feedback Panel */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl p-6 sm:p-8 flex flex-col">

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* READY */}
            {viewState === 'ready' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <button
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 flex items-center justify-center mx-auto transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 mb-6"
                >
                  <Mic className="h-8 w-8" />
                </button>
                <p className="text-sm font-medium mb-1">Ready to record</p>
                <p className="text-xs text-white/35">
                  Tap mic and speak for up to {scenario.duration} seconds
                </p>
              </div>
            )}

            {/* RECORDING */}
            {viewState === 'recording' && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-5">
                  <div className="relative inline-flex items-center justify-center w-28 h-28">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <circle
                        cx="56" cy="56" r="50" fill="none"
                        stroke={timerPercent > 25 ? '#3b82f6' : timerPercent > 10 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - timerPercent / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="text-2xl font-bold tracking-tight">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white/40">Recording live transcript...</span>
                  </div>
                </div>

                <div className="flex-1 min-h-[140px] max-h-[240px] overflow-y-auto rounded-xl bg-black/30 border border-white/[0.06] p-4 mb-5">
                  <p className="text-[10px] font-medium text-white/25 uppercase tracking-wider mb-2">Live transcript</p>
                  <p className="text-sm leading-relaxed text-white/70">
                    {transcript}
                    {interimText && <span className="text-white/30 italic">{interimText}</span>}
                    {!transcript && !interimText && <span className="text-white/20 italic">Start speaking...</span>}
                  </p>
                </div>

                <button
                  onClick={stopRecording}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Square className="h-4 w-4" /> Stop Recording
                </button>
              </div>
            )}

            {/* REVIEW */}
            {viewState === 'review' && (
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Your recorded speech</p>
                <div className="flex-1 min-h-[140px] max-h-[280px] overflow-y-auto rounded-xl bg-black/30 border border-white/[0.06] p-4 mb-5">
                  <p className="text-sm leading-relaxed text-white/70">
                    {transcript || <span className="text-white/25 italic">No speech was detected.</span>}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-sm font-medium transition-all border border-white/[0.08]"
                  >
                    🎤 Retry
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!transcript.trim()}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Get AI Analysis
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTING */}
            {viewState === 'submitting' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                  <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
                </div>
                <p className="text-sm font-medium mb-1">Analyzing speech & fumbles...</p>
                <p className="text-xs text-white/30">Comparing against previous attempts</p>
              </div>
            )}

            {/* DONE — AI Feedback Display */}
            {viewState === 'done' && analysisResult && (
              <div className="flex-1 flex flex-col overflow-y-auto pr-1">

                {/* Score Header */}
                <div className="text-center py-4 border-b border-white/[0.06] mb-5">
                  <div className="text-5xl font-extrabold text-blue-400 mb-1">
                    {analysisResult.score}<span className="text-2xl text-white/40">/100</span>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Communication Score</p>
                </div>

                {/* Encouragement */}
                {analysisResult.encouragement && (
                  <div className="mb-5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-200 leading-relaxed">{analysisResult.encouragement}</p>
                  </div>
                )}

                {/* 3 Major Problems & Step-by-Step Solutions */}
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    3 Major Focus Points
                  </p>

                  {analysisResult.feedback.map((item, idx) => {
                    const isResolved = item.status === 'resolved'
                    const isNew = item.status === 'new'
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isResolved
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : isNew
                              ? 'bg-blue-500/5 border-blue-500/20'
                              : 'bg-amber-500/5 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-white/10 text-[11px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {item.problemText}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                              isResolved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : isNew
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {isResolved ? 'Resolved ✓' : isNew ? 'New Issue' : 'Unresolved'}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed pl-6">
                          💡 <strong className="text-white/80 font-medium">Fix:</strong> {item.solutionText}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Practice Again
                  </button>
                  <button
                    onClick={openHistoryDrawer}
                    className="py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-xs font-semibold transition-all"
                  >
                    History
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Scenario History Drawer / Modal ─── */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] h-full border-l border-white/[0.08] p-6 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-400" /> Scenario History
                </h2>
                <p className="text-xs text-white/40">{scenario.title}</p>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Loading */}
            {loadingHistory ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-white/30 mb-2">No past attempts found for this scenario.</p>
                <p className="text-[11px] text-white/20">Record and submit a response to start your history track.</p>
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {/* Score Progress Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-violet-900/30 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-blue-300 tracking-wider">Total Attempts</p>
                    <p className="text-xl font-bold">{historyItems.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-semibold text-blue-300 tracking-wider flex items-center gap-1 justify-end">
                      <TrendingUp className="h-3 w-3" /> Latest Score
                    </p>
                    <p className="text-xl font-bold text-blue-400">{historyItems[0]?.score ?? 0}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Attempt Logs</p>

                  {historyItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white/60">
                          Attempt #{historyItems.length - idx}
                        </span>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          Score: {item.score}/100
                        </span>
                      </div>

                      {/* Transcript */}
                      <p className="text-xs text-white/50 bg-black/40 p-2.5 rounded-lg border border-white/[0.04] mb-3 leading-relaxed">
                        "{item.transcript}"
                      </p>

                      {/* Feedback points */}
                      {item.feedback && item.feedback.length > 0 && (
                        <div className="space-y-2">
                          {item.feedback.map((f, fIdx) => (
                            <div key={fIdx} className="text-[11px] text-white/70 flex items-start gap-1.5">
                              <span className="text-blue-400 font-bold">•</span>
                              <div>
                                <span className="font-semibold text-white">{f.problemText}:</span> {f.solutionText}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[9px] text-white/20 mt-3 text-right">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  )
}
