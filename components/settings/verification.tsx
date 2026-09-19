'use client'

import { useState, useEffect } from 'react'
import { Mail, Smartphone, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'

export function VerificationSettings() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // Mobile UI state
  const [mobileNumber, setMobileNumber] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || newEmail === email) return
    
    setSendingEmail(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    
    setSendingEmail(false)
    if (error) {
      toast('error', error.message)
    } else {
      toast('success', 'Verification link sent to new email address')
      setNewEmail('')
    }
  }

  const handleAddMobile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNumber) return
    toast('info', 'Mobile verification Coming Soon')
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-white/50">Loading verification...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader 
        title="Verification" 
        description="Verify your email and mobile number to secure your account." 
      />

      {/* Email Verification */}
      <SettingsSection title="Email Address">
        <SettingsCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{email || 'No email set'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>
        
        <SettingsCard>
          <form onSubmit={handleUpdateEmail}>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Change Email Address</label>
            <div className="flex gap-3">
              <input 
                type="email" 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
              />
              <button 
                type="submit"
                disabled={!newEmail || newEmail === email || sendingEmail}
                className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
              >
                {sendingEmail ? 'Sending...' : 'Update Email'}
              </button>
            </div>
            <p className="text-[10px] text-white/40 mt-2">
              We will send a confirmation link to your new email address.
            </p>
          </form>
        </SettingsCard>
      </SettingsSection>

      {/* Mobile Verification (UI Only) */}
      <SettingsSection title="Mobile Number">
        <SettingsCard>
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">No mobile number added</p>
                <p className="text-xs text-white/40 mt-0.5">Add a number for faster recovery</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[10px] font-medium text-white/40 uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <form onSubmit={handleAddMobile}>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Add Mobile Number</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">+91</span>
                <input 
                  type="tel" 
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="00000 00000"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
                />
              </div>
              <button 
                type="submit"
                disabled={mobileNumber.length < 10}
                className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
              >
                Send OTP
              </button>
            </div>
          </form>
        </SettingsCard>
      </SettingsSection>

      {/* Two-Step Verification (UI Only) */}
      <SettingsSection title="Two-Step Verification">
        <SettingsCard className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">Protect your account with 2FA</h4>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Two-step verification adds an extra layer of security. Even if someone obtains your password, they won&apos;t be able to log in without the verification code from your authenticator app.
              </p>
              
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/[0.04] max-w-sm mb-4">
                <QrCode className="h-10 w-10 text-white/20 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white/60 mb-0.5">Authenticator App</p>
                  <p className="text-[10px] text-white/30">Google Authenticator, Authy, etc.</p>
                </div>
              </div>

              <Toggle 
                label="Enable Two-Step Verification"
                checked={is2FAEnabled}
                onChange={(checked) => {
                  if (checked) toast('info', '2FA Setup is Coming Soon')
                  setIs2FAEnabled(checked)
                }}
              />
            </div>
            <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[10px] font-medium text-white/40 uppercase tracking-wider shrink-0">
              Coming Soon
            </span>
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
