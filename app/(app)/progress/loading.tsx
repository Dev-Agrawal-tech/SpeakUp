export default function ProgressLoading() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="h-7 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
      </nav>
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </main>
  )
}
