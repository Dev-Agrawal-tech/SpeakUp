import Link from 'next/link'
import { redirect } from 'next/navigation'
import ProgressDashboard from '@/components/progress/ProgressDashboard'
import { getUserProgress } from '@/lib/sessions/queries'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let progress
  try {
    progress = await getUserProgress(supabase, user.id)
  } catch (error) {
    console.error('Progress page error:', error)
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white">
        <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="text-xl font-bold">
            Speak<span className="text-blue-500">Up</span>
          </div>
          <Link href="/practice" className="text-sm text-blue-400 hover:text-blue-300">
            ← Practice
          </Link>
        </nav>
        <div className="mx-auto max-w-2xl px-6 py-12 text-center">
          <p className="text-white/60">Could not load your progress. Please try again.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="text-xl font-bold">
          Speak<span className="text-blue-500">Up</span>
        </div>
        <Link href="/practice" className="text-sm text-blue-400 hover:text-blue-300">
          ← Practice
        </Link>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <ProgressDashboard progress={progress} />
      </div>
    </main>
  )
}
