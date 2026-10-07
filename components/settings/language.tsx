'use client'

import { useState, useEffect } from 'react'
import { Globe, Clock, CalendarDays } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { readSettings, writeSettings, type AppSettings } from '@/lib/hooks/use-settings-store'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

const TRANSLATIONS: Record<string, any> = {
  en: {
    title: "Language & Region",
    desc: "Manage your language, time zone, and formatting preferences.",
    displayLang: "Display Language",
    chooseLang: "Choose the language used in the UI",
    timeDate: "Time & Date",
    timeZone: "Time Zone",
    dateFormat: "Date Format",
    timeFormat: "Time Format",
    save: "Save Preferences",
    saving: "Saving...",
    preview: "Current Time Preview",
  },
  hi: {
    title: "भाषा और क्षेत्र",
    desc: "अपनी भाषा, समय क्षेत्र और स्वरूपण प्राथमिकताएं प्रबंधित करें।",
    displayLang: "प्रदर्शन भाषा",
    chooseLang: "यूआई में प्रयुक्त भाषा चुनें",
    timeDate: "समय और तिथि",
    timeZone: "समय क्षेत्र",
    dateFormat: "तिथि प्रारूप",
    timeFormat: "समय प्रारूप",
    save: "प्राथमिकताएं सहेजें",
    saving: "सहेजा जा रहा है...",
    preview: "वर्तमान समय पूर्वावलोकन",
  },
  es: {
    title: "Idioma y Región",
    desc: "Administre sus preferencias de idioma, zona horaria y formato.",
    displayLang: "Idioma de visualización",
    chooseLang: "Elija el idioma utilizado en la interfaz de usuario",
    timeDate: "Hora y fecha",
    timeZone: "Zona horaria",
    dateFormat: "Formato de fecha",
    timeFormat: "Formato de hora",
    save: "Guardar preferencias",
    saving: "Guardando...",
    preview: "Vista previa de la hora actual",
  }
}

export function LanguageSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AppSettings['language'] | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const dirtyCounter = useDirtyState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

    if (!writeSettings({ ...current, language: settings })) {
      toast('error', 'Could not save language preferences on this device.')
      setSaving(false)
      return
    }

    dirtyCounter.reset()
    setSaving(false)
    toast('success', 'Language and region preferences saved')
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-sm text-white/50">Loading language settings...</div>
  }

  const t = TRANSLATIONS[settings.displayLanguage] || TRANSLATIONS.en

  let formattedTime = ''
  try {
    formattedTime = new Intl.DateTimeFormat(settings.displayLanguage, {
      timeZone: settings.timeZone === 'auto' ? undefined : settings.timeZone,
      dateStyle: 'full',
      timeStyle: 'medium',
      hour12: settings.timeFormat === '12h'
    }).format(currentTime)
  } catch (e) {
    formattedTime = currentTime.toLocaleString()
  }

  const yyyy = currentTime.getFullYear().toString()
  const mm = String(currentTime.getMonth() + 1).padStart(2, '0')
  const dd = String(currentTime.getDate()).padStart(2, '0')

  return (
    <div className="max-w-3xl">
      <SettingsHeader
        title={t.title}
        description={t.desc}
      />

      <SettingsSection title={t.displayLang}>
        <SettingsCard>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-white/40" />
            <p className="text-sm text-white/80">{t.chooseLang}</p>
          </div>
          <select
            value={settings.displayLanguage}
            onChange={(e) => updateSetting('displayLanguage', e.target.value)}
            className="w-full sm:max-w-xs bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
          >
            <option value="en" className="bg-[#0A0A0A] text-white">English (US)</option>
            <option value="hi" className="bg-[#0A0A0A] text-white">Hindi (हिन्दी)</option>
            <option value="es" className="bg-[#0A0A0A] text-white">Spanish (Español)</option>
          </select>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t.timeDate}>
        <SettingsCard className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Clock className="h-4 w-4 text-white/40" />
                {t.timeZone}
              </label>
              <select
                value={settings.timeZone}
                onChange={(e) => updateSetting('timeZone', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="auto" className="bg-[#0A0A0A] text-white">Auto-detect</option>
                <option value="Asia/Kolkata" className="bg-[#0A0A0A] text-white">India Standard Time (IST)</option>
                <option value="America/New_York" className="bg-[#0A0A0A] text-white">Eastern Time (ET)</option>
                <option value="Europe/London" className="bg-[#0A0A0A] text-white">Greenwich Mean Time (GMT)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <CalendarDays className="h-4 w-4 text-white/40" />
                {t.dateFormat}
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="MM/DD/YYYY" className="bg-[#0A0A0A] text-white">MM/DD/YYYY ({`${mm}/${dd}/${yyyy}`})</option>
                <option value="DD/MM/YYYY" className="bg-[#0A0A0A] text-white">DD/MM/YYYY ({`${dd}/${mm}/${yyyy}`})</option>
                <option value="YYYY-MM-DD" className="bg-[#0A0A0A] text-white">YYYY-MM-DD ({`${yyyy}-${mm}-${dd}`})</option>
              </select>
            </div>
          </div>
          
          <div className="h-px bg-white/[0.06]" />

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">{t.timeFormat}</label>
            <div className="flex flex-wrap rounded-xl bg-white/[0.04] p-1 w-full sm:w-fit border border-white/[0.08]">
              {['12h', '24h'].map((format) => (
                <button
                  key={format}
                  onClick={() => updateSetting('timeFormat', format as AppSettings['language']['timeFormat'])}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
          <div className="h-px bg-white/[0.06]" />
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">{t.preview}</label>
            <div className="p-3 sm:p-4 rounded-xl bg-black/40 border border-white/[0.08] text-xs sm:text-sm text-white/80 flex items-center justify-center font-mono text-center break-all">
              {formattedTime}
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] sticky bottom-0 sm:bottom-4 z-10 bg-[#0A0A0A]/95 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
        <button
          onClick={handleSave}
          disabled={!dirtyCounter.isDirty || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  )
}
