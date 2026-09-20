'use client'

import { useState, useEffect } from 'react'
import { Mail, Smartphone, ShieldCheck, CheckCircle2, QrCode, Key, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function VerificationSettings() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // Mobile UI state
  const [mobileNumber, setMobileNumber] = useState('')
  
  // Real 2FA TOTP state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [mfaModalOpen, setMfaModalOpen] = useState(false)
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [disabling, setDisabling] = useState(false)
  
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
      // Check existing MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verifiedFactor = factors?.totp?.find(f => f.status === 'verified')
      if (verifiedFactor) {
        setIs2FAEnabled(true)
        setFactorId(verifiedFactor.id)
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

  const startMfaEnrollment = async () => {
    setEnrolling(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'SpeakUp'
    })

    setEnrolling(false)
    if (error) {
      toast('error', `Failed to start 2FA setup: ${error.message}`)
      return
    }

    if (data) {
      setFactorId(data.id)
      setQrCodeSvg(data.totp.qr_code)
      setSecretKey(data.totp.secret)
      setVerifyCode('')
      setMfaModalOpen(true)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId || verifyCode.length < 6) return

    setVerifying(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verifyCode.trim()
    })

    setVerifying(false)
    if (error) {
      toast('error', `Invalid code: ${error.message}`)
    } else {
      setIs2FAEnabled(true)
      setMfaModalOpen(false)
      toast('success', 'Two-Step Verification activated successfully!')
    }
  }

  const handleDisableMfa = async () => {
    if (!factorId) return
    setDisabling(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.unenroll({
      factorId
    })
    setDisabling(false)
    if (error) {
      toast('error', error.message)
    } else {
      setIs2FAEnabled(false)
      setFactorId(null)
      setDisableModalOpen(false)
      toast('success', 'Two-Step Verification disabled')
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-white/50">Loading verification...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader 
        title="Verification" 
        description="Verify your identity, email, and secure your account with 2FA." 
      />

      {/* Email Verification (Real) */}
      <SettingsSection title="Email Address">
        <SettingsCard className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{email}</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified</span>
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

      {/* Two-Step Verification (Real TOTP with Google Authenticator) */}
      <SettingsSection title="Two-Step Verification">
        <SettingsCard className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 ${is2FAEnabled ? 'text-emerald-400' : 'text-blue-400'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium">Google Authenticator (TOTP)</h4>
                {is2FAEnabled && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Enabled
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Two-step verification adds an extra layer of security. When logging in, you will be prompted for a 6-digit code from Google Authenticator.
              </p>
              
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/[0.04] max-w-sm mb-4">
                <QrCode className="h-10 w-10 text-white/40 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white/70 mb-0.5">Time-based One Time Password</p>
                  <p className="text-[10px] text-white/30">Works with Google Authenticator & Authy</p>
                </div>
              </div>

              <Toggle 
                label={is2FAEnabled ? 'Two-Step Verification is Active' : 'Enable Two-Step Verification'}
                checked={is2FAEnabled}
                disabled={enrolling}
                onChange={(checked) => {
                  if (checked) {
                    startMfaEnrollment()
                  } else {
                    setDisableModalOpen(true)
                  }
                }}
              />
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* 2FA Setup Modal with QR Code */}
      <ConfirmDialog
        open={mfaModalOpen}
        onClose={() => setMfaModalOpen(false)}
        onConfirm={() => {}}
        title="Set up Two-Factor Authentication"
        confirmLabel=""
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-white/60">
            1. Open <strong>Google Authenticator</strong> or any TOTP app on your phone.<br />
            2. Scan the QR code below or manually copy the secret key.
          </p>

          {/* QR Code display */}
          <div className="p-4 bg-white rounded-xl flex items-center justify-center max-w-[220px] mx-auto shadow-lg">
            {qrCodeSvg ? (
              <Image 
                src={qrCodeSvg} 
                alt="2FA QR Code" 
                width={192}
                height={192}
                className="w-48 h-48"
                unoptimized
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-black text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Secret Key manual backup */}
          {secretKey && (
            <div className="bg-black/50 p-2.5 rounded-lg border border-white/[0.08] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Key className="h-4 w-4 text-white/40 shrink-0" />
                <span className="text-[11px] font-mono text-white/80 truncate select-all">{secretKey}</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(secretKey)
                  toast('success', 'Secret key copied to clipboard')
                }}
                className="px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-[10px] text-white font-medium"
              >
                Copy
              </button>
            </div>
          )}

          {/* Verification Code Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-white/80">
              3. Enter the 6-digit code shown on your phone:
            </label>
            <input 
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/[0.15] text-center text-xl tracking-[0.5em] font-mono text-white focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMfaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyCode.length < 6 || verifying}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Verify & Activate
              </button>
            </div>
          </form>
        </div>
      </ConfirmDialog>

      {/* Disable 2FA Confirm Dialog */}
      <ConfirmDialog
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        onConfirm={handleDisableMfa}
        title="Disable Two-Step Verification?"
        description="Are you sure you want to disable 2FA? Your account will only be protected by your password."
        confirmLabel="Disable 2FA"
        variant="danger"
        loading={disabling}
      />
    </div>
  )
}
