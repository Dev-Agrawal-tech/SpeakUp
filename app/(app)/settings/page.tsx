'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Shield, BadgeCheck, CreditCard, Bell,
  EyeOff, Palette, Globe, Database, HelpCircle, Plug,
  Accessibility, ChevronRight, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/components/ui/toast'
import { ProfileSettings } from '@/components/settings/profile'
import { SecuritySettings } from '@/components/settings/security'
import { VerificationSettings } from '@/components/settings/verification'
import { SubscriptionSettings } from '@/components/settings/subscription'
import { NotificationSettings } from '@/components/settings/notifications'
import { PrivacySettings } from '@/components/settings/privacy'
import { AppearanceSettings } from '@/components/settings/appearance'
import { LanguageSettings } from '@/components/settings/language'
import { AccessibilitySettings } from '@/components/settings/accessibility'
import { DataSettings } from '@/components/settings/data'
import { HelpSettings } from '@/components/settings/help'
import { IntegrationsSettings } from '@/components/settings/integrations'

/* ─── Section definitions ─── */
export interface SettingsSectionDef {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

export const settingsSections: SettingsSectionDef[] = [
  { id: 'profile', label: 'Profile', description: 'Manage your personal information and public profile.', icon: <User className="h-4 w-4" /> },
  { id: 'security', label: 'Security', description: 'Protect your account and manage login settings.', icon: <Shield className="h-4 w-4" /> },
  { id: 'verification', label: 'Verification', description: 'Verify your email and mobile number.', icon: <BadgeCheck className="h-4 w-4" /> },
  { id: 'subscription', label: 'Subscription', description: 'Manage your current plan.', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', description: 'Control how you receive notifications.', icon: <Bell className="h-4 w-4" /> },
  { id: 'privacy', label: 'Privacy & Safety', description: 'Manage visibility and privacy.', icon: <EyeOff className="h-4 w-4" /> },
  { id: 'appearance', label: 'Appearance', description: 'Customize your experience.', icon: <Palette className="h-4 w-4" /> },
  { id: 'language', label: 'Language & Region', description: 'Manage language and regional preferences.', icon: <Globe className="h-4 w-4" /> },
  { id: 'data', label: 'Data & Account', description: 'Manage your data and account.', icon: <Database className="h-4 w-4" /> },
  { id: 'help', label: 'Help & About', description: 'Get help and view application information.', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'integrations', label: 'API & Integrations', description: 'Manage API keys and connected services.', icon: <Plug className="h-4 w-4" /> },
  { id: 'accessibility', label: 'Accessibility', description: 'Adjust motion, contrast and text size.', icon: <Accessibility className="h-4 w-4" /> },
]

/* ─── Stub page for sections not yet built ─── */
function SectionStub({ section }: { section: SettingsSectionDef }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-white/30">
        {section.icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{section.label}</h3>
      <p className="text-sm text-white/35 max-w-xs">{section.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
        Coming in next phase
      </span>
    </div>
  )
}

/* ─── Overview page (all 12 cards) ─── */
function SettingsOverview({
  onSelect,
}: {
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-white/40">
          Manage your account, security, preferences and subscription.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/20 hover:bg-white/[0.04] hover:shadow-lg"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-500/[0.06] transition-all duration-500 group-hover:scale-[2.5] group-hover:bg-blue-500/[0.1]" />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 text-white/50 group-hover:text-blue-400 transition-colors">
                {section.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1">{section.label}</h3>
              <p className="text-xs text-white/35 leading-relaxed">
                {section.description}
              </p>
              <ChevronRight className="absolute top-0 right-0 h-3.5 w-3.5 text-white/15 group-hover:text-blue-400/60 transition" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Main settings layout ─── */
export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [displayName, setDisplayName] = useState('Student')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.replace('/login')
        return
      }
      supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          setDisplayName(
            profile?.username ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Student'
          )
        })
    })
  }, [])

  const currentSection = settingsSections.find((s) => s.id === activeSection)

  return (
    <ToastProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#0A0A0A] text-white"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 max-w-7xl mx-auto">
            <button
              onClick={() => {
                if (activeSection) {
                  setActiveSection(null)
                } else {
                  router.push('/dashboard')
                }
              }}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {activeSection ? 'Settings' : 'Dashboard'}
              </span>
            </button>
            <div className="flex-1" />
            <span className="text-xs text-white/30">{displayName}</span>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex">
          {/* ─── Desktop sidebar nav ─── */}
          <nav className="hidden lg:block w-56 shrink-0 border-r border-white/[0.06] py-6 px-3 sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto">
            <button
              onClick={() => setActiveSection(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                !activeSection
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                  : 'text-white/55 hover:bg-white/[0.04] hover:text-white/80 border border-transparent'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <div className="h-px bg-white/[0.06] my-2" />
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white/70 border border-transparent'
                }`}
              >
                {section.icon}
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>

          {/* ─── Mobile nav dropdown ─── */}
          <div className="lg:hidden w-full">
            {activeSection && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm"
                >
                  <span className="flex items-center gap-2">
                    {currentSection?.icon}
                    {currentSection?.label}
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 text-white/30 transition-transform ${
                      mobileNavOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {mobileNavOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-1 rounded-xl border border-white/[0.08] bg-[#111111]"
                    >
                      <button
                        onClick={() => {
                          setActiveSection(null)
                          setMobileNavOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.04] transition"
                      >
                        <Settings className="h-4 w-4" />
                        Overview
                      </button>
                      {settingsSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id)
                            setMobileNavOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                            activeSection === section.id
                              ? 'text-blue-300 bg-blue-500/10'
                              : 'text-white/50 hover:bg-white/[0.04]'
                          }`}
                        >
                          {section.icon}
                          {section.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ─── Content area ─── */}
          <main className="flex-1 min-w-0 py-6 px-4 sm:px-8 lg:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection || 'overview'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {!activeSection || !currentSection ? (
                  <SettingsOverview onSelect={setActiveSection} />
                ) : activeSection === 'profile' ? (
                  <ProfileSettings />
                ) : activeSection === 'security' ? (
                  <SecuritySettings />
                ) : activeSection === 'verification' ? (
                  <VerificationSettings />
                ) : activeSection === 'subscription' ? (
                  <SubscriptionSettings />
                ) : activeSection === 'notifications' ? (
                  <NotificationSettings />
                ) : activeSection === 'privacy' ? (
                  <PrivacySettings />
                ) : activeSection === 'appearance' ? (
                  <AppearanceSettings />
                ) : activeSection === 'language' ? (
                  <LanguageSettings />
                ) : activeSection === 'accessibility' ? (
                  <AccessibilitySettings />
                ) : activeSection === 'data' ? (
                  <DataSettings />
                ) : activeSection === 'help' ? (
                  <HelpSettings />
                ) : activeSection === 'integrations' ? (
                  <IntegrationsSettings />
                ) : (
                  <SectionStub section={currentSection} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
    </ToastProvider>
  )
}
