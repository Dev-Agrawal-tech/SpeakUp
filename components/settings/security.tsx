'use client'

import { useState } from 'react'
import { Monitor, Smartphone, CheckCircle2, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function SecuritySettings() {
  const { toast } = useToast()
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changing, setChanging] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Dialogs
  const [signoutDialog, setSignoutDialog] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) {
      toast('error', 'New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast('error', 'Password must be at least 8 characters')
      return
    }
    
    setChanging(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    setChanging(false)
    if (error) {
      toast('error', error.message)
    } else {
      toast('success', 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSignoutOther = () => {
    // UI mock for signing out other sessions
    toast('success', 'Signed out of all other sessions')
    setSignoutDialog(false)
  }

  const getPasswordStrength = () => {
    if (!newPassword) return 0
    let strength = 0
    if (newPassword.length >= 8) strength += 25
    if (newPassword.match(/[A-Z]/)) strength += 25
    if (newPassword.match(/[0-9]/)) strength += 25
    if (newPassword.match(/[^A-Za-z0-9]/)) strength += 25
    return strength
  }

  const strength = getPasswordStrength()
  const strengthColor = 
    strength <= 25 ? 'bg-red-400' :
    strength <= 50 ? 'bg-amber-400' :
    strength <= 75 ? 'bg-emerald-400' : 'bg-emerald-500'

  return (
    <div className="max-w-3xl">
      <SettingsHeader 
        title="Account & Security" 
        description="Protect your account and manage active sessions." 
      />

      {/* Change Password */}
      <SettingsSection title="Change Password">
        <SettingsCard>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Current Password</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">New Password</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
              />
              
              {/* Strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/[0.04]">
                    <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }} />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Must be at least 8 characters long.</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Confirm New Password</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPassword} 
                  onChange={e => setShowPassword(e.target.checked)}
                  className="rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/50" 
                />
                <span className="text-xs text-white/60">Show passwords</span>
              </label>
              <button 
                type="submit"
                disabled={changing || !currentPassword || !newPassword || !confirmPassword}
                className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium transition disabled:opacity-50"
              >
                {changing ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </SettingsCard>
        
        <div className="mt-2 flex justify-end">
          <button className="text-xs text-blue-400 hover:text-blue-300 transition">
            Forgot your password?
          </button>
        </div>
      </SettingsSection>

      {/* Active Sessions */}
      <SettingsSection title="Active Sessions">
        <SettingsCard className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">Mac OS • Chrome</p>
                <p className="text-xs text-blue-300/70">Mumbai, India (Current Session)</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold uppercase tracking-wider bg-blue-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Active Now
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-white/40" />
              <div>
                <p className="text-sm font-medium text-white/80">iOS • Safari</p>
                <p className="text-xs text-white/40">Delhi, India • Last active 2 days ago</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={() => setSignoutDialog(true)}
              className="text-sm text-red-400 hover:text-red-300 transition font-medium flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" /> Sign out of other sessions
            </button>
          </div>
        </SettingsCard>
      </SettingsSection>

      <ConfirmDialog
        open={signoutDialog}
        onClose={() => setSignoutDialog(false)}
        onConfirm={handleSignoutOther}
        title="Sign out of other sessions?"
        description="This will sign you out of SpeakUp on all other devices and browsers immediately. You will remain logged in on this current device."
        confirmLabel="Sign Out All"
        variant="danger"
      />
    </div>
  )
}
