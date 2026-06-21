'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const goals = [
  { id: 'interview', icon: '🎯', title: 'Job Interview', desc: 'HR rounds, technical intros, behavioural questions' },
  { id: 'pitch', icon: '🚀', title: 'Startup Pitch', desc: 'Investor Q&A, elevator pitch, market explanation' },
  { id: 'classroom', icon: '🎓', title: 'Classroom Speaking', desc: 'Presentations, group discussions, viva' },
  { id: 'daily', icon: '💼', title: 'Daily Communication', desc: 'Team meetings, senior interactions, client calls' },
  { id: 'public', icon: '🎤', title: 'Public Speaking', desc: 'Speeches, events, college introductions' },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          onboarding_goal: selected,
          plan_type: 'free',
        })
    }

    router.push('/app/practice')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">
            Speak<span className="text-blue-500">Up</span>
          </h1>
          <h2 className="text-xl font-semibold mb-2">
            What do you want to improve?
          </h2>
          <p className="text-white/50 text-sm">
            Pick one. You can always change it later.
          </p>
        </div>

        {/* Goal Cards */}
        <div className="space-y-3 mb-8">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setSelected(goal.id)}
              className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-4
                ${selected === goal.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
            >
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <p className="font-medium text-sm">{goal.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{goal.desc}</p>
              </div>
              {selected === goal.id && (
                <span className="ml-auto text-blue-400 text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-xl text-sm font-medium transition"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>

        <p className="text-center text-xs text-white/30 mt-4">
          Your goal helps us personalise your practice scenarios
        </p>

      </div>
    </main>
  )
}