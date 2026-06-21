export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="text-xl font-bold text-white">
          Speak<span className="text-blue-500">Up</span>
        </div>
        <div className="flex gap-3">
          <a href="/login"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition">
            Login
          </a>
          <a href="/signup"
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition">
            Get Started Free
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 py-24 max-w-3xl mx-auto">
        <div className="mb-4 px-3 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
          AI Communication Coach for India
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Stop hesitating.<br />
          <span className="text-blue-500">Start speaking.</span>
        </h1>
        <p className="text-lg text-white/60 mb-8 max-w-xl">
          Practise real-world speaking scenarios. Get honest AI feedback.
          Build confidence for interviews, pitches, and presentations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/signup"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition">
            Start Practising Free →
          </a>
          <a href="#how-it-works"
            className="px-6 py-3 border border-white/20 hover:border-white/40 rounded-xl text-sm text-white/70 hover:text-white transition">
            See How It Works
          </a>
        </div>
        <p className="mt-4 text-xs text-white/30">
          Free to start. No credit card. No download.
        </p>
      </section>

      {/* PROBLEMS */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-10 text-white/90">
          Sound familiar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { q: '"I freeze during interviews"', d: 'You know the answer but words disappear under pressure.' },
            { q: '"I cannot explain my idea"', d: 'Your startup concept is brilliant — but you cannot pitch it.' },
            { q: '"My English is not confident"', d: 'You understand everything but hesitate when speaking.' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <p className="text-blue-400 font-medium mb-2">{item.q}</p>
              <p className="text-sm text-white/50">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-10 text-white/90">
          How SpeakUp works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Pick a scenario', desc: 'Interview, pitch, classroom, or daily conversation.' },
            { step: '2', title: 'Speak into mic', desc: 'Talk naturally. No scripts. Just you speaking.' },
            { step: '3', title: 'AI analyses', desc: 'Checks fluency, clarity, confidence, and structure.' },
            { step: '4', title: 'Improve and retry', desc: 'Get 2-3 specific fixes. Speak again. See your score rise.' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <p className="font-medium mb-1 text-sm">{item.title}</p>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-10 text-white/90">
          Built for every situation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Job Interviews', desc: 'HR rounds, technical intros, behavioural questions' },
            { icon: '🚀', title: 'Startup Pitches', desc: 'Investor Q&A, elevator pitch, market explanation' },
            { icon: '🎓', title: 'Classroom', desc: 'Presentations, group discussions, teacher interactions' },
            { icon: '💼', title: 'Daily Work', desc: 'Team meetings, client calls, senior conversations' },
            { icon: '🎤', title: 'Public Speaking', desc: 'Speeches, events, college introductions' },
            { icon: '🤝', title: 'Networking', desc: 'Meeting new people, sales calls, professional events' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-medium text-sm mb-1">{item.title}</p>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Ready to speak with confidence?
        </h2>
        <p className="text-white/50 mb-8 text-sm">
          Join thousands of students and founders practising with SpeakUp.
        </p>
        <a href="/signup"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition inline-block">
          Start Free — No Credit Card Needed
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
        <p>© 2026 SpeakUp. Built for India. Free to start.</p>
        <div className="flex justify-center gap-6 mt-3">
          <a href="/privacy" className="hover:text-white/60 transition">Privacy</a>
          <a href="/terms" className="hover:text-white/60 transition">Terms</a>
          <a href="/about" className="hover:text-white/60 transition">About</a>
        </div>
      </footer>

    </main>
  )
}