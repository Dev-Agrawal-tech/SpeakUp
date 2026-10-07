/**
 * Settings store — thin localStorage abstraction.
 * Replace the read/write helpers with Supabase calls
 * when you're ready to persist settings server-side.
 */

const STORAGE_KEY = 'speakup_settings'

export interface AppSettings {
  version: 1
  // Notifications
  notifications: {
    loginAlerts: boolean
    securityNotifications: boolean
    accountActivity: boolean
    productUpdates: boolean
    newFeatures: boolean
    newsletter: boolean
    practiceReminders: boolean
    emailChannel: boolean
    inAppChannel: boolean
    pushChannel: boolean
    smsChannel: boolean
    sounds: boolean
    toastPopups: boolean
    desktopNotifications: boolean
  }
  // Privacy
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections'
    activityVisible: boolean
    onlineStatus: boolean
    analyticsSharing: boolean
    aiTrainingConsent: boolean
    personalization: boolean
  }
  // Appearance
  appearance: {
    theme: 'dark' | 'light' | 'system'
    accentColor: 'blue' | 'purple' | 'emerald' | 'rose'
    uiDensity: 'compact' | 'normal' | 'relaxed'
    animations: boolean
  }
  // Language & Region
  language: {
    displayLanguage: string
    timeZone: string
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
  // Accessibility
  accessibility: {
    reduceMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}

const defaultSettings: AppSettings = {
  version: 1,
  notifications: {
    loginAlerts: true,
    securityNotifications: true,
    accountActivity: true,
    productUpdates: true,
    newFeatures: true,
    newsletter: false,
    practiceReminders: true,
    emailChannel: true,
    inAppChannel: true,
    pushChannel: false,
    smsChannel: false,
    sounds: true,
    toastPopups: true,
    desktopNotifications: false,
  },
  privacy: {
    profileVisibility: 'public',
    activityVisible: true,
    onlineStatus: true,
    analyticsSharing: false,
    aiTrainingConsent: false,
    personalization: true,
  },
  appearance: {
    theme: 'dark', // App is natively dark
    accentColor: 'blue',
    uiDensity: 'normal',
    animations: true,
  },
  language: {
    displayLanguage: 'en',
    timeZone: 'auto',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
}

type SettingsRecord = Record<string, unknown>

function asRecord(value: unknown): SettingsRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as SettingsRecord
    : {}
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? value as T : fallback
}

export function normalizeSettings(value: unknown): AppSettings {
  const root = asRecord(value)
  const notifications = asRecord(root.notifications)
  const privacy = asRecord(root.privacy)
  const appearance = asRecord(root.appearance)
  const language = asRecord(root.language)
  const accessibility = asRecord(root.accessibility)

  return {
    version: 1,
    notifications: {
      loginAlerts: booleanValue(notifications.loginAlerts, defaultSettings.notifications.loginAlerts),
      securityNotifications: booleanValue(notifications.securityNotifications, defaultSettings.notifications.securityNotifications),
      accountActivity: booleanValue(notifications.accountActivity, defaultSettings.notifications.accountActivity),
      productUpdates: booleanValue(notifications.productUpdates, defaultSettings.notifications.productUpdates),
      newFeatures: booleanValue(notifications.newFeatures, defaultSettings.notifications.newFeatures),
      newsletter: booleanValue(notifications.newsletter, defaultSettings.notifications.newsletter),
      practiceReminders: booleanValue(notifications.practiceReminders, defaultSettings.notifications.practiceReminders),
      emailChannel: booleanValue(notifications.emailChannel, defaultSettings.notifications.emailChannel),
      inAppChannel: booleanValue(notifications.inAppChannel, defaultSettings.notifications.inAppChannel),
      pushChannel: booleanValue(notifications.pushChannel, defaultSettings.notifications.pushChannel),
      smsChannel: booleanValue(notifications.smsChannel, defaultSettings.notifications.smsChannel),
      sounds: booleanValue(notifications.sounds, defaultSettings.notifications.sounds),
      toastPopups: booleanValue(notifications.toastPopups, defaultSettings.notifications.toastPopups),
      desktopNotifications: booleanValue(notifications.desktopNotifications, defaultSettings.notifications.desktopNotifications),
    },
    privacy: {
      profileVisibility: enumValue(privacy.profileVisibility, ['public', 'private', 'connections'] as const, defaultSettings.privacy.profileVisibility),
      activityVisible: booleanValue(privacy.activityVisible, defaultSettings.privacy.activityVisible),
      onlineStatus: booleanValue(privacy.onlineStatus, defaultSettings.privacy.onlineStatus),
      analyticsSharing: booleanValue(privacy.analyticsSharing, defaultSettings.privacy.analyticsSharing),
      aiTrainingConsent: booleanValue(privacy.aiTrainingConsent, defaultSettings.privacy.aiTrainingConsent),
      personalization: booleanValue(privacy.personalization, defaultSettings.privacy.personalization),
    },
    appearance: {
      theme: enumValue(appearance.theme, ['dark', 'light', 'system'] as const, defaultSettings.appearance.theme),
      accentColor: enumValue(appearance.accentColor, ['blue', 'purple', 'emerald', 'rose'] as const, defaultSettings.appearance.accentColor),
      uiDensity: enumValue(appearance.uiDensity, ['compact', 'normal', 'relaxed'] as const, defaultSettings.appearance.uiDensity),
      animations: booleanValue(appearance.animations, defaultSettings.appearance.animations),
    },
    language: {
      displayLanguage: enumValue(language.displayLanguage, ['en', 'hi', 'es'] as const, defaultSettings.language.displayLanguage),
      timeZone: typeof language.timeZone === 'string' ? language.timeZone : defaultSettings.language.timeZone,
      dateFormat: enumValue(language.dateFormat, ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] as const, defaultSettings.language.dateFormat),
      timeFormat: enumValue(language.timeFormat, ['12h', '24h'] as const, defaultSettings.language.timeFormat),
    },
    accessibility: {
      reduceMotion: booleanValue(accessibility.reduceMotion, defaultSettings.accessibility.reduceMotion),
      highContrast: booleanValue(accessibility.highContrast, defaultSettings.accessibility.highContrast),
      fontSize: enumValue(accessibility.fontSize, ['small', 'medium', 'large'] as const, defaultSettings.accessibility.fontSize),
    },
  }
}

export function applySettingsToDocument(settings: AppSettings): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)')
  const applyTheme = () => {
    root.dataset.theme = settings.appearance.theme === 'system'
      ? systemTheme.matches ? 'light' : 'dark'
      : settings.appearance.theme
    root.dataset.themePreference = settings.appearance.theme
  }

  applyTheme()
  if (!root.dataset.systemThemeListener) {
    systemTheme.addEventListener('change', () => {
      if (root.dataset.themePreference === 'system') {
        root.dataset.theme = systemTheme.matches ? 'light' : 'dark'
      }
    })
    root.dataset.systemThemeListener = 'true'
  }

  root.dataset.accent = settings.appearance.accentColor
  root.dataset.density = settings.appearance.uiDensity
  root.dataset.fontSize = settings.accessibility.fontSize
  root.classList.toggle('high-contrast', settings.accessibility.highContrast)
  root.classList.toggle('reduce-motion-override', settings.accessibility.reduceMotion || !settings.appearance.animations)
}

export function readSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeSettings(JSON.parse(raw)) : normalizeSettings(defaultSettings)
  } catch {
    return normalizeSettings(defaultSettings)
  }
}

export function writeSettings(settings: AppSettings): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)))
    window.dispatchEvent(new Event('settings-updated'))
    return true
  } catch {
    return false
  }
}

export { defaultSettings }
