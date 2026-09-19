'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    const supabase = createClient()
    let email = identifier.trim()
    if (!email.includes('@')) {
      const response = await fetch('/api/auth/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email }),
      })
      const result = await response.json() as { email?: string }
      email = result.email || ''
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message.includes('Email not confirmed')
        ? 'Please confirm your email before logging in.'
        : 'Incorrect email or password.')
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setError('')
    if (!identifier.trim() || !identifier.includes('@')) {
      setError('Enter your account email to reset your password.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier.trim(), {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })

    if (resetError) setError(resetError.message)
    else setError('If an account exists for this email, a password reset link is on its way.')
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })
    if (error) setError(error.message)
    setGoogleLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Speak<span className="text-blue-500">Up</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Login to continue practising
          </p>
        </div>

          <div className="space-y-4">

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-100 transition flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">
                Email address or username
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or username"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {error && <p className={`text-sm ${error.startsWith('If an account') ? 'text-green-400' : 'text-red-400'}`}>{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading || googleLoading || !identifier || !password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-medium transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button onClick={handleForgotPassword} disabled={loading} className="w-full text-center text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
              Forgot password?
            </button>

          </div>

        <p className="text-center text-xs text-white/30 mt-6">
          No account?{' '}
          <a href="/signup" className="text-blue-400 hover:text-blue-300">
            Sign up free
          </a>
        </p>

      </div>
    </main>
  )
}