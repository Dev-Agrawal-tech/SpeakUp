import Recorder from '@/components/audio/Recorder'

const SCENARIO = "You are in a job interview. The interviewer says: Tell me about yourself. Speak for 60 seconds and introduce yourself clearly and confidently."

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">

      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="text-xl font-bold">
          Speak<span className="text-blue-500">Up</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Scenario Card */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
              Interview
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
              Beginner
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
              60 seconds
            </span>
          </div>

          <h2 className="text-lg font-semibold mb-3">
            Introduce yourself professionally
          </h2>

          <p className="text-white/60 text-sm leading-relaxed">
            You are in a job interview. The interviewer says:
            <span className="text-white font-medium">
              {' '}"Tell me about yourself."
            </span>
            {' '}Speak for 60 seconds and introduce yourself clearly.
          </p>
        </div>

        {/* Recorder + Feedback */}
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
          <Recorder scenario={SCENARIO} />
        </div>

      </div>
    </main>
  )
}