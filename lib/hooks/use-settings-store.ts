/**
 * Settings store — thin localStorage abstraction.
 * Replace the read/write helpers with Supabase calls
 * when you're ready to persist settings server-side.
 */

const STORAGE_KEY = 'speakup_settings'

export interface AppSettings {
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
    analyticsSharing: true,
    aiTrainingConsent: true,
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

export function readSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export function writeSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // quota exceeded — silently fail
  }
}

export { defaultSettings }
