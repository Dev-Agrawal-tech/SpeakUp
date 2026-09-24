'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function NotificationSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['notifications'] | null>(null)

  // Track dirty state with a simple counter
  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readSettings().notifications)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false)
  }, [])

  const toggle = (key: keyof AppSettings['notifications']) => {
    if (!settings) return
    setSettings({ ...settings, [key]: !settings[key] })
    dirtyCounter.update(dirtyCounter.value + 1)
  }

  const handleSave = () => {
    if (!settings) return
    setSaving(true)
    const current = readSettings()
    writeSettings({ ...current, notifications: settings })
    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Notification preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading notifications...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Notifications"
        description="Control how and when you receive notifications."
      />

      {/* Security */}
      <SettingsSection title="Security">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Login alerts"
            description="Get notified when someone logs into your account"
            checked={settings.loginAlerts}
            onChange={() => toggle('loginAlerts')}
          />
          <Toggle
            label="Security notifications"
            description="Password changes, new devices, and suspicious activity"
            checked={settings.securityNotifications}
            onChange={() => toggle('securityNotifications')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Account Activity */}
      <SettingsSection title="Account Activity">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Account activity"
            description="Profile updates, plan changes, and session completions"
            checked={settings.accountActivity}
            onChange={() => toggle('accountActivity')}
          />
          <Toggle
            label="Practice reminders"
            description="Daily nudges to keep your speaking streak alive"
            checked={settings.practiceReminders}
            onChange={() => toggle('practiceReminders')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Product */}
      <SettingsSection title="Product">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Product updates"
            description="Major feature releases and improvements"
            checked={settings.productUpdates}
            onChange={() => toggle('productUpdates')}
          />
          <Toggle
            label="New features"
            description="Be the first to know about new capabilities"
            checked={settings.newFeatures}
            onChange={() => toggle('newFeatures')}
          />
          <Toggle
            label="Newsletter"
            description="Tips, stories, and communication insights"
            checked={settings.newsletter}
            onChange={() => toggle('newsletter')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Channels */}
      <SettingsSection title="Notification Channels">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Email"
            description="Receive notifications via email"
            checked={settings.emailChannel}
            onChange={() => toggle('emailChannel')}
          />
          <Toggle
            label="In-app"
            description="Receive notifications inside SpeakUp"
            checked={settings.inAppChannel}
            onChange={() => toggle('inAppChannel')}
          />
          <Toggle
            label="Push notifications"
            description="Browser push notifications"
            checked={settings.pushChannel}
            onChange={() => toggle('pushChannel')}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-white/80">SMS</span>
              <p className="text-xs text-white/35 mt-0.5">Text message notifications</p>
            </div>
            <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[10px] font-medium text-white/40 uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* In-app Extras */}
      <SettingsSection title="In-App Experience">
        <SettingsCard className="space-y-5">
          <Toggle
            label="Notification sounds"
            description="Play a sound when notifications arrive"
            checked={settings.sounds}
            onChange={() => toggle('sounds')}
          />
          <Toggle
            label="Toast popups"
            description="Show floating notifications for actions"
            checked={settings.toastPopups}
            onChange={() => toggle('toastPopups')}
          />
          <Toggle
            label="Desktop notifications"
            description="Show browser desktop notifications"
            checked={settings.desktopNotifications}
            onChange={() => toggle('desktopNotifications')}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] sticky bottom-4 z-10 bg-[#0A0A0A]/95 p-4 rounded-2xl backdrop-blur-md">
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
