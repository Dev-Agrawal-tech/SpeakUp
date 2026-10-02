'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Camera, Check, Link as LinkIcon, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { SettingsHeader, SettingsSection, SettingsCard } from './primitives'
import { Toggle } from '@/components/ui/toggle'
import { useDirtyState } from '@/lib/hooks/use-unsaved-changes'

export function ProfileSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [memberSince, setMemberSince] = useState('')

  // Real DB fields
  const nameState = useDirtyState('')
  const usernameState = useDirtyState('')
  const bioState = useDirtyState('')
  const locationState = useDirtyState('')
  const websiteState = useDirtyState('')
  const linkedinState = useDirtyState('')
  const skillsState = useDirtyState('')
  const [showEmail, setShowEmail] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const isDirty = nameState.isDirty || usernameState.isDirty || bioState.isDirty || 
    locationState.isDirty || websiteState.isDirty || linkedinState.isDirty || skillsState.isDirty

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setMemberSince(new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }))
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
        if (profile) {
          nameState.reset(profile.name || '')
          usernameState.reset(profile.username || '')
          bioState.reset(profile.bio || '')
          locationState.reset(profile.location || '')
          websiteState.reset(profile.website || '')
          linkedinState.reset(profile.linkedin || '')
          skillsState.reset(Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || ''))
          setShowEmail(profile.show_email ?? true)
          setAvatarUrl(profile.avatar_url || null)
        }
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast('error', 'Avatar image must be less than 2MB')
      return
    }

    setUploadingAvatar(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploadingAvatar(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast('error', `Upload failed: ${uploadError.message}`)
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Save to user profile table
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      toast('error', `Failed to update profile picture: ${updateError.message}`)
    } else {
      setAvatarUrl(publicUrl)
      toast('success', 'Profile photo updated!')
    }
    setUploadingAvatar(false)
  }

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', user.id)
    if (!error) {
      setAvatarUrl(null)
      toast('success', 'Profile photo removed')
    } else {
      toast('error', error.message)
    }
    setUploadingAvatar(false)
  }

  const handleSave = async () => {
    if (!isDirty) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const skillsArray = skillsState.value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const { error } = await supabase.from('users').update({
        name: nameState.value,
        username: usernameState.value || null,
        bio: bioState.value || null,
        location: locationState.value || null,
        website: websiteState.value || null,
        linkedin: linkedinState.value || null,
        skills: skillsArray,
        show_email: showEmail
      }).eq('id', user.id)
      
      if (error) {
        toast('error', `Failed to save profile: ${error.message}`)
        setSaving(false)
        return
      }
      
      nameState.reset()
      usernameState.reset()
      bioState.reset()
      locationState.reset()
      websiteState.reset()
      linkedinState.reset()
      skillsState.reset()
      
      toast('success', 'Profile updated successfully')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-white/50">Loading profile...</div>
  }

  return (
    <div className="max-w-3xl">
      <SettingsHeader 
        title="Profile" 
        description="Manage your personal information and public profile." 
      />

      {/* Avatar & Header */}
      <SettingsCard className="mb-6 flex flex-col sm:flex-row items-center gap-6">
        <label className="relative group cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarUpload} 
            disabled={uploadingAvatar}
            className="hidden" 
          />
          {avatarUrl ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
              <Image 
                src={avatarUrl} 
                alt="Avatar" 
                fill
                className="object-cover" 
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-3xl font-bold">
              {nameState.value.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
            <Camera className="h-5 w-5 text-white/80" />
            <span className="text-[10px] font-medium text-white/80">
              {uploadingAvatar ? '...' : 'Upload'}
            </span>
          </div>
        </label>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-lg font-semibold">{nameState.value || 'Student'}</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              Active
            </span>
          </div>
          <p className="text-xs text-white/40 mb-3">Member since {memberSince}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <label className="cursor-pointer px-4 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium transition">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                disabled={uploadingAvatar}
                className="hidden" 
              />
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </label>
            {avatarUrl && (
              <button 
                type="button"
                onClick={handleAvatarRemove}
                disabled={uploadingAvatar}
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Basic Info */}
      <SettingsSection title="Personal Information">
        <SettingsCard className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={nameState.value} 
                onChange={e => nameState.update(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                <input 
                  type="text" 
                  value={usernameState.value} 
                  onChange={e => usernameState.update(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
                  placeholder="username"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Bio</label>
            <textarea 
              value={bioState.value}
              onChange={e => bioState.update(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="A short bio about yourself and your language goals..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition resize-none" 
            />
            <div className="text-right text-[10px] text-white/30 mt-1">
              {bioState.value.length} / 160
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Location</label>
            <input 
              type="text" 
              value={locationState.value}
              onChange={e => locationState.update(e.target.value)}
              placeholder="e.g. Bangalore, India"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      {/* Professional / Social (UI Only) */}
      <SettingsSection title="Links & Professional">
        <SettingsCard className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Portfolio / Website</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input 
                  type="url" 
                  value={websiteState.value}
                  onChange={e => websiteState.update(e.target.value)}
                  placeholder="https://"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">LinkedIn URL</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input 
                  type="url" 
                  value={linkedinState.value}
                  onChange={e => linkedinState.update(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Core Skills (comma separated)</label>
            <input 
              type="text" 
              value={skillsState.value}
              onChange={e => skillsState.update(e.target.value)}
              placeholder="e.g. JavaScript, Public Speaking, Management"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm focus:border-blue-500/50 focus:outline-none transition" 
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsCard className="space-y-5">
          <Toggle 
            label="Show email on profile" 
            description="Allow other users to see your email address"
            checked={showEmail}
            onChange={setShowEmail}
          />
        </SettingsCard>
      </SettingsSection>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] sticky bottom-4 z-10 bg-[#0A0A0A]/95 p-4 rounded-2xl backdrop-blur-md">
        <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.06] transition">
          Preview Profile
        </button>
        <button 
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          {saving ? 'Saving...' : (
            <>
              <Check className="h-4 w-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
