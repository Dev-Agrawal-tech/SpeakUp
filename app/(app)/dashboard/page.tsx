'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Clock3, Layers3, Search, LogOut,
  ChevronRight, Sparkles, Filter, Settings
} from 'lucide-react'
import { scenarioTracks, LEVELS, type ScenarioLevel } from '@/lib/scenarios/catalogue'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('Student')
  const [selectedTrackId, setSelectedTrackId] = useState(scenarioTracks[0].id)
  const [selectedLevel, setSelectedLevel] = useState<ScenarioLevel | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    const loadUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()

      const username = profile?.username ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Student'

      if (active) setDisplayName(username)
    }

    void loadUserName()

    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  const track = useMemo(
    () => scenarioTracks.find((t) => t.id === selectedTrackId) ?? scenarioTracks[0],
    [selectedTrackId]
  )

  const filteredScenarios = useMemo(() => {
    let scenarios = track.scenarios
    if (selectedLevel !== 'All') {
      scenarios = scenarios.filter((s) => s.level === selectedLevel)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      scenarios = scenarios.filter(
        (s) => s.title.toLowerCase().includes(q) || s.prompt.toLowerCase().includes(q)
      )
    }
    return scenarios
  }, [track, selectedLevel, searchQuery])

  const levelColors: Record<string, string> = {
    Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    Easy: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    Hard: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    Expert: 'bg-red-500/15 text-red-400 border-red-500/20',
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* ─── Mobile overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-72 border-r border-white/[0.06]
          bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Speak<span className="text-blue-500">Up</span>
          </Link>
          <p className="text-[11px] text-white/30 mt-1">AI Communication Coach</p>
        </div>

        {/* Category List */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            Categories
          </p>
          <div className="space-y-0.5">
            {scenarioTracks.map((t) => {
              const isActive = t.id === selectedTrackId
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTrackId(t.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                      : 'text-white/55 hover:bg-white/[0.04] hover:text-white/80 border border-transparent'
                    }
                  `}
                >
                  <span className="text-base leading-none">{t.icon}</span>
                  <span className="flex-1 text-left truncate">{t.title}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400/60" />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-white/30">Free Plan</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push('/settings')}
                aria-label="Settings"
                title="Settings"
                className="text-white/25 hover:text-white/60 transition p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
                title="Log out"
                className="text-white/25 hover:text-white/60 transition p-1 rounded-lg hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-8">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
            >
              <Layers3 className="h-4 w-4 text-white/60" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>

            {/* Right links */}
            <Link
              href="/progress"
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition"
            >
              Progress <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-6xl">
          {/* ─── Hero Section ─── */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#172552]/80 via-[#11172b]/80 to-transparent p-6 sm:p-8 mb-8">
            <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${track.accent} opacity-15 blur-3xl`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{track.icon}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/15 bg-blue-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                  <Sparkles className="h-3 w-3" /> {track.scenarios.length} Scenarios
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{track.title}</h1>
              <p className="text-sm text-white/50 max-w-xl">{track.description}</p>
            </div>
          </div>

          {/* ─── Level Selector ─── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-3.5 w-3.5 text-white/30" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Filter by level</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel('All')}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedLevel === 'All'
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/15 hover:text-white/60'
                }`}
              >
                All Levels
              </button>
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedLevel === level
                      ? levelColors[level]
                      : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/15 hover:text-white/60'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Scenario Grid ─── */}
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-sm">No scenarios match your filter.</p>
              <button
                onClick={() => { setSelectedLevel('All'); setSearchQuery('') }}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredScenarios.map((scenario, index) => (
                <button
                  key={scenario.id}
                  onClick={() => router.push(`/scenario/${scenario.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.035] hover:border-blue-500/50 hover:bg-white/[0.10] hover:shadow-[0_45px_80px_-15px_rgba(0,0,0,0.75),0_0_60px_-10px_rgba(37,99,235,0.3)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]"
                >
                  {/* Glow */}
                  <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br ${track.accent} opacity-[0.18] transition-all duration-500 group-hover:scale-[2] group-hover:opacity-[0.35]`} />

                  <div className="relative">
                    {/* Top row */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/50 group-hover:text-white/90 transition-colors tracking-wider">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelColors[scenario.level]}`}>
                        {scenario.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="min-h-[2.75rem] text-[16px] font-bold leading-snug mb-2 text-white/80 group-hover:text-white transition-colors">
                      {scenario.title}
                    </h4>

                    {/* Prompt preview */}
                    <p className="text-[13px] text-white/50 line-clamp-2 mb-6 leading-relaxed group-hover:text-white/70 transition-colors">
                      {scenario.prompt}
                    </p>

                    {/* Bottom */}
                    <div className="flex items-center justify-between text-[12px] text-white/40 pt-4 border-t border-white/[0.04]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock3 className="h-3.5 w-3.5" /> {scenario.duration}s
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-blue-400 opacity-80 group-hover:opacity-100 transition-all">
                        Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bottom tip */}
          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/35">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-400/60" />
            One focused retry beats a perfect first take. Your coach gives you 3 improvements at a time.
          </div>
        </div>
      </main>
    </div>
  )
}
