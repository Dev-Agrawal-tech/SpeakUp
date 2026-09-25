'use client'

import { useState, useEffect } from 'react'
import { Globe, Clock, CalendarDays } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function LanguageSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['language'] | null>(null)

  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readSettings().language)
    setLoading(false)
  }, [])

  const updateSetting = <K extends keyof AppSettings['language']>(key: K, value: AppSettings['language'][K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    dirtyCounter.update(dirtyCounter.value + 1)
  }

  const handleSave = () => {
    if (!settings) return
    setSaving(true)
    const current = readSettings()
    
    writeSettings({ ...current, language: settings })

    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Language and region preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading language settings...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Language & Region"
        description="Manage your language, time zone, and formatting preferences."
      />

      <SettingsSection title="Display Language">
        <SettingsCard>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-white/40" />
            <p className="text-sm text-white/80">Choose the language used in the UI</p>
          </div>
          <select
            value={settings.displayLanguage}
            onChange={(e) => updateSetting('displayLanguage', e.target.value)}
            className="w-full sm:max-w-xs bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi (Coming Soon)</option>
            <option value="es">Spanish (Coming Soon)</option>
          </select>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Time & Date">
        <SettingsCard className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Clock className="h-4 w-4 text-white/40" />
                Time Zone
              </label>
              <select
                value={settings.timeZone}
                onChange={(e) => updateSetting('timeZone', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="auto">Auto-detect</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <CalendarDays className="h-4 w-4 text-white/40" />
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
              </select>
            </div>
          </div>
          
          <div className="h-px bg-white/[0.06]" />

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">Time Format</label>
            <div className="flex rounded-xl bg-white/[0.04] p-1 w-fit border border-white/[0.08]">
              {['12h', '24h'].map((format) => (
                <button
                  key={format}
                  onClick={() => updateSetting('timeFormat', format as AppSettings['language']['timeFormat'])}
                  className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    settings.timeFormat === format
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {format === '12h' ? '12-hour (1:00 PM)' : '24-hour (13:00)'}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

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
