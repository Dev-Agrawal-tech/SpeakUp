'use client'

import { HelpCircle, ExternalLink, Mail, MessageSquareWarning, FileText, Shield, Info } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'

export function HelpSettings() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'

  return (
    <div className="max-w-3xl pb-20">
      <SettingsHeader
        title="Help & About"
        description="Get support, read our policies, and learn more about SpeakUp."
      />

      <SettingsSection title="Support">
        <SettingsCard className="space-y-2">
          <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Help Center</p>
                <p className="text-xs text-white/40 mt-0.5">Browse FAQs and guides</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition" />
          </a>

          <a href="mailto:support@speakup.ai" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                <Mail className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Contact Support</p>
                <p className="text-xs text-white/40 mt-0.5">Email our support team</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition" />
          </a>

          <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <MessageSquareWarning className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Report a Problem</p>
                <p className="text-xs text-white/40 mt-0.5">Let us know if something isn&apos;t working</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition" />
          </a>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Legal">
        <SettingsCard className="space-y-2">
          <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition group">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-white/40" />
              <p className="text-sm font-medium text-white/80">Terms of Service</p>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition" />
          </a>

          <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition group">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-white/40" />
              <p className="text-sm font-medium text-white/80">Privacy Policy</p>
            </div>
            <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition" />
          </a>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsCard>
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Info className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">SpeakUp</h3>
              <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
                AI communication coaching for real-world conversations. Practice speaking with confidence in a safe, judgment-free environment.
              </p>
            </div>
            <div className="pt-4 flex flex-col items-center gap-1">
              <span className="text-xs text-white/30 font-medium">Version {version}</span>
              <span className="text-[10px] text-white/20">© 2026 SpeakUp AI. All rights reserved.</span>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
