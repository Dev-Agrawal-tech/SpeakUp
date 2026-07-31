import Link from 'next/link'
import ScenarioStudio from '@/components/practice/ScenarioStudio'

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">

      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="text-xl font-bold">
          Speak<span className="text-blue-500">Up</span>
        </div>
        <Link href="/progress" className="text-sm text-white/55 transition hover:text-white">My progress</Link>
      </nav>
      <ScenarioStudio />
    </main>
  )
}
