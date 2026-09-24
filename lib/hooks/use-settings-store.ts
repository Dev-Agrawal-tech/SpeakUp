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
