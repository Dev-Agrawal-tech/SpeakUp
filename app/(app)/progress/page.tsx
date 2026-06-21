export default function ProgressPage() {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white">
  
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="text-xl font-bold">
            Speak<span className="text-blue-500">Up</span>
          </div>
          <a href="/practice" className="text-sm text-blue-400 hover:text-blue-300">
            ← Practice
          </a>
        </nav>
  
        <div className="max-w-2xl mx-auto px-6 py-12">
  
          {/* Overall Score */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6 text-center">
            <p className="text-xs text-white/40 mb-2">Your SpeakScore</p>
            <div className="text-6xl font-bold text-blue-400 mb-1">--</div>
            <p className="text-xs text-white/30">Complete a session to see your score</p>
          </div>
  
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Sessions', value: '0' },
              { label: 'Streak', value: '0 🔥' },
              { label: 'Completed', value: '0' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
  
          {/* Score Breakdown */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
            <p className="text-sm font-medium text-white/60 mb-4">Score breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Clarity', score: 0 },
                { label: 'Fluency', score: 0 },
                { label: 'Confidence', score: 0 },
                { label: 'Structure', score: 0 },
                { label: 'Relevance', score: 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-20">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
  
          {/* Recent Sessions */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-sm font-medium text-white/60 mb-4">Recent sessions</p>
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">No sessions yet</p>
              
                <a href="/practice"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition"
              >
                Start Practising →
              </a>
            </div>
          </div>
  
        </div>
      </main>
    )
  }