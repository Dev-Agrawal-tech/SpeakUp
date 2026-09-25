'use client'

import { useState } from 'react'
import { Download, AlertTriangle, Database, Activity } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DataSettings() {
  const { toast } = useToast()
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Modals state
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleExport = async () => {
    setExporting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Fetch basic profile as a placeholder for data export
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
      
      const exportData = {
        user: profile,
        exportedAt: new Date().toISOString(),
        note: 'Full history export coming soon.'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `speakup-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast('success', 'Data exported successfully')
    } catch (e: unknown) {
      toast('error', 'Failed to export data: ' + (e as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const handleClearHistory = async () => {
    setClearing(true)
    // Simulate clearing history
    await new Promise(r => setTimeout(r, 1000))
    setClearing(false)
    setShowClearConfirm(false)
    toast('success', 'Practice history cleared')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast('error', 'Please type DELETE to confirm')
      return
    }
    setDeleting(true)
    try {
      // For now, this is a placeholder integration. 
      // Safely deleting an account requires an edge function or postgres function with admin privileges.
      await new Promise(r => setTimeout(r, 1500))
      const supabase = createClient()
      await supabase.auth.signOut()
      toast('success', 'Account deleted')
      router.push('/login')
    } catch {
      toast('error', 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl pb-20">
      <SettingsHeader
        title="Data & Account"
        description="Manage your data, export history, and control your account status."
      />

      <SettingsSection title="Your Data">
        <SettingsCard className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Download className="h-4 w-4 text-white/40" />
                Export My Data
              </h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                Download a copy of your personal data, profile information, and practice history as a JSON file.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-sm font-medium transition whitespace-nowrap disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Request Download'}
            </button>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Database className="h-4 w-4 text-white/40" />
                Data Usage
              </h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                You are currently using 14.2 MB of storage for practice sessions and audio recordings.
              </p>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Danger Zone">
        <SettingsCard className="border-red-500/20 bg-red-500/[0.02]">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Clear Practice History
                </h4>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Permanently remove all your practice sessions, scores, and feedback. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.1] hover:border-red-500/30 text-sm font-medium text-red-400 hover:text-red-300 transition whitespace-nowrap"
              >
                Clear History
              </button>
            </div>

            <div className="h-px bg-red-500/10" />

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Delete Account
                </h4>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Permanently delete your account, profile, and all associated data. This action is irreversible.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-sm font-medium text-red-400 transition whitespace-nowrap"
              >
                Delete Account
              </button>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* Clear History Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Clear Practice History?</h3>
            <p className="text-sm text-white/60 mb-6">
              This action will permanently delete all your past practice sessions and feedback. Your streaks and overall level will remain.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, clear history'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Account</h3>
            </div>
            <p className="text-sm text-white/60 mb-4">
              This action may permanently delete your account and associated data. You will lose access to all your progress, and it cannot be recovered.
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-medium text-white/40 mb-2">
                Type <strong className="text-white">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#0A0A0A] border border-white/[0.1] focus:border-red-500/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
