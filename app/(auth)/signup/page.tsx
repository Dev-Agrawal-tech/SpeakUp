'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async () => {
    setError('')
    const normalizedUsername = username.trim().toLowerCase()
    if (!name.trim() || !email.trim() || !normalizedUsername || password.length < 8) {
      setError('Enter your name, username, email, and a password with at least 8 characters.')
      return
    }
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError('Username must be 3-20 characters using only letters, numbers, and underscores.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const availabilityResponse = await fetch('/api/auth/username-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizedUsername }),
    })
    const availability = await availabilityResponse.json() as { available?: boolean }
    if (!availability.available) {
      setError('That username is already taken. Please choose a different username.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username: normalizedUsername },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })

    const isExistingAccount = signupError?.message.toLowerCase().includes('already registered')
      || data.user?.identities?.length === 0

    if (isExistingAccount) {
      setError('This email is already registered. Please log in or use a different email address.')
    } else if (signupError) {
      setError(signupError.message)
    } else if (data.session) {
      window.location.href = '/onboarding'
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    setError('')
    setResendLoading(true)
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })

    if (resendError) setError(resendError.message)
    else setError('A new confirmation link was requested. Check Gmail, including Spam and Promotions.')
    setResendLoading(false)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })
    if (error) setError(error.message)
    setGoogleLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Speak<span className="text-blue-500">Up</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Create your free account
          </p>
        </div>

        {!sent ? (
          <div className="space-y-4">

            {/* Google Signup */}
            <button
              onClick={handleGoogleSignup}
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

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Singh"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="arjun_singh"
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading || googleLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-medium transition"
            >
              {loading ? 'Creating account...' : 'Create Free Account →'}
            </button>

            <p className="text-center text-xs text-white/30">
              We will email you a confirmation link. No credit card required.
            </p>

          </div>
        ) : (
          <div className="text-center p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="font-medium mb-2">Check your email!</h2>
            <p className="text-sm text-white/50">
              We sent a confirmation link to{' '}
              <span className="text-white">{email}</span>
            </p>
            <p className="text-xs text-white/40 mt-3">
              Check Spam and Promotions too. It can take a few minutes to arrive.
            </p>
            {error && <p className={`text-xs mt-3 ${error.startsWith('A new') ? 'text-green-400' : 'text-red-400'}`}>{error}</p>}
            <button
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              {resendLoading ? 'Requesting...' : 'Resend confirmation email'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-white/30 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </a>
        </p>

      </div>
    </main>
  )
}