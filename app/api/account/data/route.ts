import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const [profile, sessions, scores, feedback, completions] = await Promise.all([
      admin.from('users').select('*').eq('id', user.id).maybeSingle(),
      admin.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      admin.from('scores').select('*').eq('user_id', user.id),
      admin.from('feedback_items').select('*').eq('user_id', user.id),
      admin.from('scenario_completions').select('*').eq('user_id', user.id),
    ])

    const failed = [profile, sessions, scores, feedback, completions].find((result) => result.error)
    if (failed?.error) throw failed.error

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      user: profile.data,
      sessions: sessions.data ?? [],
      scores: scores.data ?? [],
      feedback: feedback.data ?? [],
      completions: completions.data ?? [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to export account data.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as { mode?: string; confirmation?: string }
    const mode = body.mode
    if (mode === 'delete-account' && body.confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Type DELETE to confirm account deletion.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const deletes = mode === 'clear-history'
      ? [
          admin.from('feedback_items').delete().eq('user_id', user.id),
          admin.from('scores').delete().eq('user_id', user.id),
          admin.from('scenario_completions').delete().eq('user_id', user.id),
          admin.from('sessions').delete().eq('user_id', user.id),
        ]
      : []

    for (const operation of deletes) {
      const { error } = await operation
      if (error) throw error
    }

    if (mode === 'delete-account') {
      const avatarStorage = admin.storage.from('avatars')
      const [ownedFiles, legacyFiles] = await Promise.all([
        avatarStorage.list(user.id),
        avatarStorage.list('', { search: user.id }),
      ])
      if (ownedFiles.error) throw ownedFiles.error
      if (legacyFiles.error) throw legacyFiles.error
      const paths = [
        ...(ownedFiles.data ?? []).map((object) => `${user.id}/${object.name}`),
        ...(legacyFiles.data ?? []).filter((object) => object.name.startsWith(`${user.id}-`)).map((object) => object.name),
      ]
      if (paths.length > 0) {
        const { error: removeError } = await avatarStorage.remove(paths)
        if (removeError) throw removeError
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
      if (deleteError) throw deleteError
      return NextResponse.json({ success: true, mode })
    }

    if (mode === 'clear-history') return NextResponse.json({ success: true, mode })
    return NextResponse.json({ error: 'Unsupported account operation.' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Account operation failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}