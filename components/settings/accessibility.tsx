'use client'

import { useState, useEffect } from 'react'
import { Type } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { applySettingsToDocument, readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function AccessibilitySettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['accessibility'] | null>(null)

  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readSettings().accessibility)
    setLoading(false)
  }, [])

  const updateSetting = <K extends keyof AppSettings['accessibility']>(key: K, value: AppSettings['accessibility'][K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    dirtyCounter.update(dirtyCounter.value + 1)
  }

  const handleSave = () => {
    if (!settings) return
    setSaving(true)
    const updated = { ...readSettings(), accessibility: settings }

    if (!writeSettings(updated)) {
      toast('error', 'Could not save accessibility preferences on this device.')
      setSaving(false)
      return
    }

    applySettingsToDocument(updated)

    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Accessibility preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading accessibility settings...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Accessibility"
        description="Adjust contrast, motion, and text size to your needs."
      />

      <SettingsSection title="Vision & Display">
        <SettingsCard className="space-y-6">
          <Toggle
            label="High Contrast"
            description="Increase contrast across the application for better readability"
            checked={settings.highContrast}
            onChange={(val) => updateSetting('highContrast', val)}
          />

          <div className="h-px bg-white/[0.06]" />

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
              <Type className="h-4 w-4 text-white/40" />
              Font Size
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50">A</span>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={settings.fontSize === 'small' ? 0 : settings.fontSize === 'medium' ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  updateSetting('fontSize', val === 0 ? 'small' : val === 1 ? 'medium' : 'large')
                }}
                className="flex-1 accent-blue-500 h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg text-white/80">A</span>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] text-white/40">Small</span>
              <span className="text-[10px] text-white/40">Medium</span>
              <span className="text-[10px] text-white/40">Large</span>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Motion">
        <SettingsCard>
          <Toggle
            label="Reduce Motion"
            description="Minimize or disable interface animations and transitions"
            checked={settings.reduceMotion}
            onChange={(val) => updateSetting('reduceMotion', val)}
          />
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
