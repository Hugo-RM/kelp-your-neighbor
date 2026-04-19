'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../../utils/supabase/client'

interface Profile {
  full_name: string
  email: string
  avatar_url: string
  is_carpooler: boolean
  bio: string
}

interface Event {
  id: string
  title: string
  event_date: string
  category: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    avatar_url: '',
    is_carpooler: false,
    bio: '',
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          is_carpooler: user.user_metadata?.is_carpooler || false,
          bio: user.user_metadata?.bio || '',
        })
        setAvatarPreview(user.user_metadata?.avatar_url || '')

        const today = new Date().toISOString().split('T')[0]
        const { data: registrations } = await supabase
          .from('registrations')
          .select('event_id')
          .eq('user_id', user.id)

        if (registrations && registrations.length > 0) {
          const eventIds = registrations.map((r) => r.event_id)
          const { data: events } = await supabase
            .from('events')
            .select('id, title, event_date, category')
            .in('id', eventIds)
            .gte('event_date', today)
            .order('event_date', { ascending: true })

          setUpcomingEvents(events || [])
        }
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const showBanner = (message: string) => {
    setSuccessBanner(message)
    setTimeout(() => setSuccessBanner(null), 5000)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    let newAvatarUrl = profile.avatar_url

    // Upload new avatar if selected
    if (avatarFile) {
      const { data: { user } } = await supabase.auth.getUser()
      const filePath = `avatars/${user?.id}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        newAvatarUrl = urlData.publicUrl
      }
    }

    // Check if email changed
    const { data: { user } } = await supabase.auth.getUser()
    const emailChanged = profile.email !== user?.email
    const oldEmail = user?.email || ''

    if (emailChanged) {
      // Update email in Supabase Auth (this triggers Supabase's own confirmation,
      // but we suppress it via dashboard setting: Auth > Email > "Secure email change" off,
      // and "Enable email confirmations" off for our custom flow)
      await supabase.auth.updateUser({ email: profile.email })

      // Send branded notification to the OLD email via our own API route
      await fetch('/api/send-email-change-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEmail,
          newEmail: profile.email,
          userName: profile.full_name || oldEmail,
        }),
      })

      showBanner(
        `A confirmation has been sent to ${profile.email}. We also notified your old address (${oldEmail}).`
      )
    }

    // Update metadata: avatar, bio (name is intentionally excluded — read-only)
    await supabase.auth.updateUser({
      data: {
        avatar_url: newAvatarUrl,
        bio: profile.bio,
      },
    })

    setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }))
    setAvatarFile(null)
    setSaving(false)
    setEditing(false)

    if (!emailChanged) {
      showBanner('Profile updated successfully.')
    }
  }

  const handleCancel = () => {
    setAvatarPreview(profile.avatar_url)
    setAvatarFile(null)
    setEditing(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : profile.email[0]?.toUpperCase() || '?'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success banner */}
        {successBanner && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl shadow-sm">
            <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>{successBanner}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-normal text-gray-900 tracking-tight">My Profile</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#6384ff] flex items-center justify-center text-white text-2xl font-medium border-2 border-gray-100">
                  {initials}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#6384ff] rounded-full flex items-center justify-center shadow-md hover:bg-[#4d6ef0] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {/* Name (always read-only), email, bio, and carpooler badge */}
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900">{profile.full_name || 'No name set'}</h2>
              <p className="text-sm text-gray-400 mt-1">{profile.email}</p>

              {/* Bio — shown below name when not editing */}
              {!editing && profile.bio && (
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">{profile.bio}</p>
              )}

              {profile.is_carpooler && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-[#6384ff] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="2"/>
                    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  </svg>
                  Carpooler
                </div>
              )}
            </div>
          </div>

          {/* Editable fields — name is intentionally omitted */}
          {editing && (
            <div className="space-y-4 border-t border-gray-100 pt-6">

              {/* Read-only name notice */}
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Full name</label>
                <div className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-400 select-none">
                  {profile.full_name || '—'}
                </div>
                <p className="text-xs text-gray-400 mt-1">Your name cannot be changed.</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                  className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#6384ff] focus:ring-1 focus:ring-[#6384ff] resize-none"
                  placeholder="Tell others a little about yourself…"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{profile.bio.length}/200</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#6384ff] focus:ring-1 focus:ring-[#6384ff]"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Changing your email will notify both your old and new addresses.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-[#6384ff] text-white text-sm font-medium rounded-lg hover:bg-[#4d6ef0] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-base font-medium text-gray-900 mb-5">Upcoming events</h3>

          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">You have no upcoming events. Browse events to register!</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {event.category && ` · ${event.category}`}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    Registered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}