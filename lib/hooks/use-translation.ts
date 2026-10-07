import { useEffect, useState } from 'react'
import { readSettings, defaultSettings } from './use-settings-store'

export const TRANSLATIONS: Record<string, any> = {
  en: {
    sidebar: {
      coach: "AI Communication Coach",
      categories: "Categories",
      freePlan: "Free Plan",
    },
    dashboard: {
      search: "Search scenarios...",
      level: "Level",
      allLevels: "All Levels",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      start: "Start",
      completed: "Completed"
    },
    settings: {
      back: "Back to Dashboard",
      title: "Settings"
    }
  },
  hi: {
    sidebar: {
      coach: "एआई संचार कोच",
      categories: "श्रेणियाँ",
      freePlan: "मुफ्त योजना",
    },
    dashboard: {
      search: "परिदृश्य खोजें...",
      level: "स्तर",
      allLevels: "सभी स्तर",
      beginner: "शुरुआती",
      intermediate: "मध्यम",
      advanced: "उन्नत",
      start: "शुरू करें",
      completed: "पूरा हुआ"
    },
    settings: {
      back: "डैशबोर्ड पर वापस जाएं",
      title: "सेटिंग्स"
    }
  },
  es: {
    sidebar: {
      coach: "Entrenador de Comunicación AI",
      categories: "Categorías",
      freePlan: "Plan Gratuito",
    },
    dashboard: {
      search: "Buscar escenarios...",
      level: "Nivel",
      allLevels: "Todos los niveles",
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      start: "Comenzar",
      completed: "Completado"
    },
    settings: {
      back: "Volver al panel",
      title: "Ajustes"
    }
  }
}

export function useTranslation() {
  const [lang, setLang] = useState(defaultSettings.language.displayLanguage)

  useEffect(() => {
    // We check local storage for settings dynamically
    const settings = readSettings()
    setLang(settings.language.displayLanguage)

    // Optional: listen to storage events if settings change in another tab
    const handleStorage = () => {
      setLang(readSettings().language.displayLanguage)
    }
    window.addEventListener('storage', handleStorage)
    
    // Custom event for when settings save in the same window
    const handleCustom = () => {
      setLang(readSettings().language.displayLanguage)
    }
    window.addEventListener('settings-updated', handleCustom)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('settings-updated', handleCustom)
    }
  }, [])

  return TRANSLATIONS[lang] || TRANSLATIONS.en
}
