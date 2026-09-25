'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function AppearanceSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['appearance'] | null>(null)

  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    setSettings(readSettings().appearance)
    setLoading(false)
  }, [])

  const updateSetting = <K extends keyof AppSettings['appearance']>(key: K, value: AppSettings['appearance'][K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    dirtyCounter.update(dirtyCounter.value + 1)
  }

  const handleSave = () => {
    if (!settings) return
    setSaving(true)
    const current = readSettings()
    
    // Save to localStorage
    writeSettings({ ...current, appearance: settings })
    
    // Apply changes to the DOM instantly
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-system')
    document.documentElement.classList.add(`theme-${settings.theme}`)
    
    // Note: Accent colors and density would map to CSS variables or data attributes on :root
    document.documentElement.setAttribute('data-accent', settings.accentColor)
    document.documentElement.setAttribute('data-density', settings.uiDensity)
    
    if (settings.animations) {
      document.documentElement.classList.remove('reduce-motion-override')
    } else {
      document.documentElement.classList.add('reduce-motion-override')
    }

    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Appearance preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading appearance settings...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title="Appearance"
        description="Customize how SpeakUp looks on your device."
      />

      <SettingsSection title="Theme">
        <SettingsCard>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { id: 'dark', label: 'Dark', icon: Moon, desc: 'Natively dark' },
              { id: 'light', label: 'Light', icon: Sun, desc: 'Coming soon' },
              { id: 'system', label: 'System', icon: Monitor, desc: 'Syncs with device' },
            ].map((theme) => {
              const Icon = theme.icon
              const isSelected = settings.theme === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => updateSetting('theme', theme.id)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.06] text-white/60'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-semibold mb-1 ${isSelected ? 'text-blue-400' : 'text-white/80'}`}>
                    {theme.label}
                  </span>
                  <span className="text-xs text-white/40">{theme.desc}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-white/40 mt-4 text-center">
            SpeakUp is primarily designed for Dark mode.
          </p>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Accent Color">
        <SettingsCard>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'blue', color: 'bg-blue-500' },
              { id: 'purple', color: 'bg-purple-500' },
              { id: 'emerald', color: 'bg-emerald-500' },
              { id: 'rose', color: 'bg-rose-500' },
            ].map((accent) => (
              <button
                key={accent.id}
                onClick={() => updateSetting('accentColor', accent.id)}
                className={`w-12 h-12 rounded-full ${accent.color} flex items-center justify-center transition-transform hover:scale-110 ${
                  settings.accentColor === accent.id ? 'ring-4 ring-white/20 ring-offset-2 ring-offset-[#0A0A0A]' : 'opacity-80'
                }`}
                title={accent.id.charAt(0).toUpperCase() + accent.id.slice(1)}
              >
                {settings.accentColor === accent.id && <Sparkles className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Layout & Animation">
        <SettingsCard className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">UI Density</label>
            <div className="flex rounded-xl bg-white/[0.04] p-1 w-fit border border-white/[0.08]">
              {['compact', 'normal', 'relaxed'].map((density) => (
                <button
                  key={density}
                  onClick={() => updateSetting('uiDensity', density)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    settings.uiDensity === density
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-px bg-white/[0.06]" />

          <Toggle
            label="Enable animations"
            description="Show smooth transitions and micro-interactions"
            checked={settings.animations}
            onChange={(val) => updateSetting('animations', val)}
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
