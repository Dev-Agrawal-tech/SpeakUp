'use client'

import { useState, useEffect } from 'react'
import { Ban, Flag } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function PrivacySettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['privacy'] | null>(null)

  // Track dirty state
  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readSettings().privacy)
    setLoading(false)
  }, [])

  const toggle = (key: keyof AppSettings['privacy']) => {
    if (!settings) return
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] })
      dirtyCounter.update(dirtyCounter.value + 1)
    }
  }

  const setProfileVisibility = (val: AppSettings['privacy']['profileVisibility']) => {
    if (!settings) return
    setSettings({ ...settings, profileVisibility: val })
    dirtyCounter.update(dirtyCounter.value + 1)
  }

  const handleSave = () => {
    if (!settings) return
    setSaving(true)
    const current = readSettings()
    if (!writeSettings({ ...current, privacy: settings })) {
      toast('error', 'Could not save privacy preferences on this device.')
      setSaving(false)
      return
    }
    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Privacy & safety preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading privacy settings...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Privacy & Safety"
        description="Control your visibility, data sharing, and safety preferences."
      />

      {/* Visibility */}
      <SettingsSection title="Profile Visibility">
        <SettingsCard className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">Who can view your profile?</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: 'public', label: 'Public', desc: 'Anyone can view' },
                { id: 'connections', label: 'Connections', desc: 'Only people you connect with' },
                { id: 'private', label: 'Private', desc: 'Only you' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setProfileVisibility(option.id as AppSettings['privacy']['profileVisibility'])}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    settings.profileVisibility === option.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-sm font-medium mb-1 ${settings.profileVisibility === option.id ? 'text-blue-400' : 'text-white/80'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-white/40">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <Toggle
            label="Show activity status"
            description="Allow others to see your practice streaks and recent activity"
            checked={settings.activityVisible}
            onChange={() => toggle('activityVisible')}
          />
          <Toggle
            label="Show online status"
            description="Allow others to see when you are actively using SpeakUp"
            checked={settings.onlineStatus}
            onChange={() => toggle('onlineStatus')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Data & AI */}
      <SettingsSection title="Data & AI">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Share usage analytics"
            description="Help us improve SpeakUp by sharing anonymous usage data"
            checked={settings.analyticsSharing}
            onChange={() => toggle('analyticsSharing')}
          />
          <Toggle
            label="AI Training Consent"
            description="Allow your practice recordings to be used to improve our AI coaching models"
            checked={settings.aiTrainingConsent}
            onChange={() => toggle('aiTrainingConsent')}
          />
          <Toggle
            label="Personalization"
            description="Use your learning history to personalize scenario recommendations"
            checked={settings.personalization}
            onChange={() => toggle('personalization')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Safety (UI Only placeholders for future features) */}
      <SettingsSection title="Safety">
        <SettingsCard className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Ban className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Blocked Users</p>
                  <p className="text-xs text-white/40 mt-0.5">Manage accounts you have blocked</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium transition">
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Reported Content</p>
                  <p className="text-xs text-white/40 mt-0.5">View status of your reports</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium transition">
                View
              </button>
            </div>
        </SettingsCard>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] sticky bottom-0 sm:bottom-4 z-10 bg-[#0A0A0A]/95 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
        <button
          onClick={handleSave}
          disabled={!dirtyCounter.isDirty || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
