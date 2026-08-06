'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, ChevronLeft, Clock3, Layers3, Sparkles, Target } from 'lucide-react'
import Recorder from '@/components/audio/Recorder'
import { scenarioTracks, type Scenario } from '@/lib/scenarios/catalogue'

export default function ScenarioStudio() {
  const [selectedTrack, setSelectedTrack] = useState(scenarioTracks[0].id)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const track = useMemo(() => scenarioTracks.find((item) => item.id === selectedTrack) ?? scenarioTracks[0], [selectedTrack])

  if (selectedScenario) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <button onClick={() => setSelectedScenario(null)} className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ChevronLeft className="h-4 w-4" /> All practice scenarios
        </button>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11172a] p-7 shadow-2xl shadow-blue-950/40 sm:p-9">
            <div className={`absolute -right-20 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${track.accent} opacity-20 blur-2xl`} />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200">{track.title}</span><span className="flex items-center gap-1 text-xs text-white/45"><Clock3 className="h-3.5 w-3.5" /> {selectedScenario.duration}s</span></div>
              <p className="mb-3 text-sm font-medium text-blue-300">Your speaking mission</p>
              <h1 className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">{selectedScenario.title}</h1>
              <p className="max-w-xl text-base leading-7 text-white/65">{selectedScenario.prompt}</p>
              <div className="mt-8 flex flex-wrap gap-2"><span className="rounded-lg bg-white/7 px-3 py-1.5 text-xs text-white/60">{selectedScenario.level}</span><span className="rounded-lg bg-white/7 px-3 py-1.5 text-xs text-white/60">Focused feedback</span><span className="rounded-lg bg-white/7 px-3 py-1.5 text-xs text-white/60">Retry to improve</span></div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
            <Recorder
              scenario={selectedScenario.prompt}
              scenarioId={selectedScenario.id}
              scenarioTitle={selectedScenario.title}
              scenarioTrack={track.id}
              scenarioLevel={selectedScenario.level}
              maxDuration={selectedScenario.duration}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#172552] via-[#11172b] to-[#0a0a0a] p-7 shadow-2xl shadow-blue-950/30 sm:p-10">
        <div className="absolute right-8 top-7 h-28 w-28 rounded-[2rem] border border-blue-200/20 bg-gradient-to-br from-blue-300/30 to-violet-500/10 shadow-[-18px_20px_45px_rgba(0,0,0,.35)] [transform:rotate(18deg)_skewY(-5deg)]" />
        <div className="absolute right-28 top-28 h-16 w-16 rounded-full bg-cyan-300/20 blur-md" />
        <div className="relative max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200"><Sparkles className="h-3.5 w-3.5" /> Your communication gym</div><h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Practice for the moment that matters.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Choose a real-world situation. Speak freely. Get just the next few improvements that move your score forward.</p></div>
      </div>
      <div className="mb-7 flex items-center justify-between"><div><p className="text-sm font-medium text-blue-300">Scenario library</p><h2 className="mt-1 text-2xl font-semibold">150 ways to find your voice</h2></div><div className="hidden items-center gap-2 text-sm text-white/45 sm:flex"><Layers3 className="h-4 w-4" /> 10 tracks · 15 cases each</div></div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{scenarioTracks.map((item) => <button key={item.id} onClick={() => setSelectedTrack(item.id)} className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm transition ${selectedTrack === item.id ? 'border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-950/30' : 'border-white/10 bg-white/[0.035] text-white/55 hover:border-white/25 hover:text-white'}`}>{item.title}</button>)}</div>
      <div className="mb-6 flex items-end justify-between"><div><h3 className="text-xl font-semibold">{track.title}</h3><p className="mt-1 text-sm text-white/50">{track.description}</p></div><span className="hidden text-sm text-white/35 sm:block">15 guided cases</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{track.scenarios.map((scenario, index) => <button key={scenario.id} onClick={() => setSelectedScenario(scenario)} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-300/35 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_rgba(0,0,0,.3)]"><div className={`absolute -right-8 -top-9 h-24 w-24 rounded-full bg-gradient-to-br ${track.accent} opacity-[.13] transition group-hover:scale-150`} /><div className="relative"><div className="mb-6 flex items-center justify-between"><span className="text-xs text-white/35">{String(index + 1).padStart(2, '0')}</span><span className="rounded-full bg-white/7 px-2 py-1 text-[10px] text-white/50">{scenario.level}</span></div><h4 className="min-h-11 text-base font-medium leading-5">{scenario.title}</h4><div className="mt-5 flex items-center justify-between text-xs text-white/45"><span>{scenario.duration}s practice</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-blue-300" /></div></div></button>)}</div>
      <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/55"><Target className="h-5 w-5 shrink-0 text-blue-400" /> One focused retry beats a perfect first take. Your coach will give you no more than three improvements at a time.</div>
    </section>
  )
}
