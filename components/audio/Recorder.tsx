'use client'

import { useState, useRef } from 'react'

type RecorderState = 'idle' | 'recording' | 'processing' | 'done'

interface FeedbackItem {
  title: string
  explanation: string
  technique: string
}

interface FeedbackResult {
  transcript: string
  score: number
  encouragement: string
  feedback: FeedbackItem[]
  scores: {
    clarity: number
    fluency: number
    confidence: number
    structure: number
    relevance: number
  }
}

interface RecorderProps {
  scenario: string
}

export default function Recorder({ scenario }: RecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState<FeedbackResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypeRef = useRef<string>('audio/webm')

  const startRecording = async () => {
    try {
      setError(null)
      setResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

      // Best mime type select karo
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      mimeTypeRef.current = mimeType
      chunksRef.current = []

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())

        if (chunksRef.current.length === 0) {
          setError('No audio recorded. Please try again.')
          setState('idle')
          return
        }

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })

        if (blob.size < 1000) {
          setError('Recording too short. Please speak for at least 5 seconds.')
          setState('idle')
          return
        }

        await analyzeAudio(blob)
      }

      // Har 500ms pe data save karo
      recorder.start(500)
      setState('recording')
      setSeconds(0)

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 59) {
            stopRecording()
            return 60
          }
          return s + 1
        })
      }, 1000)

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Mic access denied. Please allow microphone permission in browser settings.')
      } else {
        setError('Could not access microphone. Please check your device.')
      }
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
      setState('processing')
    }
  }

  const analyzeAudio = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('scenario', scenario)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setState('idle')
        return
      }

      setResult(data)
      setState('done')

    } catch (err) {
      setError('Analysis failed. Please check your internet and try again.')
      setState('idle')
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setSeconds(0)
    setState('idle')
    chunksRef.current = []
  }

  const formatTime = (s: number) => {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Recording UI */}
      {state !== 'done' && (
        <div className="text-center">

          {/* Timer */}
          {state === 'recording' && (
            <div className="mb-6">
              <div className="text-5xl font-bold text-white mb-2">
                {formatTime(seconds)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-white/50">Recording... speak clearly</span>
              </div>
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="mb-6">
              <p className="text-white/40 text-sm animate-pulse">
                Analysing your speech...
              </p>
            </div>
          )}

          {/* Mic Button */}
          {state === 'idle' && (
            <div className="mb-4">
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 flex items-center justify-center mx-auto transition-all text-4xl shadow-lg shadow-blue-500/20"
              >
                🎤
              </button>
            </div>
          )}

          {/* Stop Button */}
          {state === 'recording' && (
            <div className="mb-4">
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center mx-auto transition-all text-4xl shadow-lg shadow-red-500/20"
              >
                ⏹
              </button>
            </div>
          )}

          {/* Processing Spinner */}
          {state === 'processing' && (
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* Label */}
          <p className="text-xs text-white/40">
            {state === 'idle' && 'Tap mic and speak for at least 10 seconds'}
            {state === 'recording' && 'Tap stop when you are done speaking'}
          </p>

        </div>
      )}

      {/* Feedback UI */}
      {state === 'done' && result && (
        <div className="space-y-5">

          {/* SpeakScore */}
          <div className="text-center py-4">
            <div className="text-6xl font-bold text-blue-400 mb-1">
              {result.score}
            </div>
            <div className="text-white/40 text-sm">SpeakScore / 100</div>
          </div>

          {/* Encouragement */}
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm leading-relaxed">
              {result.encouragement}
            </p>
          </div>

          {/* Transcript */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/40 mb-2 font-medium">
              📝 What you said:
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              {result.transcript}
            </p>
          </div>

          {/* Feedback Points */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/60">
              Focus on these {result.feedback.length} things:
            </p>
            {result.feedback.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1 text-white">
                      {item.title}
                    </p>
                    <p className="text-white/50 text-xs mb-2 leading-relaxed">
                      {item.explanation}
                    </p>
                    <p className="text-blue-400 text-xs leading-relaxed">
                      💡 {item.technique}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Score Breakdown */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">
              Score breakdown:
            </p>
            <div className="space-y-3">
              {Object.entries(result.scores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-20 capitalize">
                    {key}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Try Again */}
          <button
            onClick={reset}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl text-sm font-medium transition-all"
          >
            🎤 Try Again
          </button>

        </div>
      )}

    </div>
  )
}