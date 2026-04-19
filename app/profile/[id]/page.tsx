'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../utils/supabase/client'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  is_carpooler: boolean
  username: string
  rating_avg: number | null
  rating_count: number
}

interface Rating {
  score: number
  rater_id: string
}

import { use } from 'react'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  console.log('Profile ID from URL:', id)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [existingRating, setExistingRating] = useState<Rating | null>(null)
  const [score, setScore] = useState<number>(7)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [carpoolId, setCarpoolId] = useState<string | null>(null)
  const [hasCarpooledTogether, setHasCarpooledTogether] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // Get current logged in user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Fetch the profile being viewed
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

        console.log('Profile data:', profileData)
        console.log('Profile error:', error)

      if (profileData) setProfile(profileData)

      // Check if current user has carpooled with this driver
      // Check if current user has carpooled with this driver
      if (user) {
        const { data: carpoolInfo } = await supabase
          .from('carpool_requests')
          .select('carpool_id, carpools!inner(id, driver_id)')
          .eq('passenger_id', user.id)
          .eq('status', 'accepted')
          .eq('carpools.driver_id', id)
          .limit(1)

        console.log('Carpool check:', carpoolInfo)

        if (carpoolInfo && carpoolInfo.length > 0) {
          setHasCarpooledTogether(true)
          setCarpoolId(carpoolInfo[0].carpool_id)
        }

        // Check if user already submitted a rating
        const { data: existingRatingData } = await supabase
          .from('ratings')
          .select('score, rater_id')
          .eq('driver_id', id)
          .eq('rater_id', user.id)
          .single()

        if (existingRatingData) {
          setExistingRating(existingRatingData)
          setScore(existingRatingData.score)
          setSubmitted(true)
        }
      }

      setLoading(false)
    }

    load()
  }, [id])

  const handleSubmitRating = async () => {
    if (!currentUserId || !carpoolId) return
    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('ratings')
      .insert({
        driver_id: id,
        rater_id: currentUserId,
        carpool_id: carpoolId,
        score,
      })

    if (insertError) {
      setError('Something went wrong. You may have already rated this driver.')
    } else {
      setSubmitted(true)
      // Refresh profile to show updated rating
      const { data: updated } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (updated) setProfile(updated)
    }

    setSubmitting(false)
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?'

  const isOwnProfile = currentUserId === id

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </a>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-6">

            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#6384ff] flex items-center justify-center text-white text-2xl font-medium border-2 border-gray-100">
                {initials}
              </div>
            )}

            <div className="text-center">
              <h1 className="text-xl font-medium text-gray-900">
                {profile.full_name || profile.username || 'Anonymous'}
              </h1>
              {profile.username && (
                <p className="text-sm text-gray-400 mt-0.5">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Carpooler badge */}
            {profile.is_carpooler && (
              <div className="inline-flex items-center gap-1.5 bg-[#6384ff] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
                  <rect x="9" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                </svg>
                Carpooler
              </div>
            )}
          </div>

          {/* Rating summary */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-700">Driver rating</h2>
              {profile.rating_count > 0 && (
                <span className="text-xs text-gray-400">{profile.rating_count} {profile.rating_count === 1 ? 'rating' : 'ratings'}</span>
              )}
            </div>

            {profile.rating_avg ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold text-gray-900">
                  {Number(profile.rating_avg).toFixed(1)}
                </span>
                <div className="flex flex-col gap-1">
                  {/* Visual bar */}
                  <div className="w-40 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6384ff] transition-all"
                      style={{ width: `${(profile.rating_avg / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">out of 10</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No ratings yet.</p>
            )}
          </div>
        </div>

        {/* Rating section */}
        {!isOwnProfile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-base font-medium text-gray-900 mb-1">Rate this driver</h2>

            {!currentUserId ? (
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500">
                You need to{' '}
                <a href="/auth" className="text-[#6384ff] hover:underline font-medium">
                  sign in
                </a>{' '}
                to leave a rating.
              </div>
            ) : !hasCarpooledTogether ? (
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500">
                You can only rate drivers you have carpooled with.
              </div>
            ) : submitted ? (
              <div className="mt-3 flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>You rated this driver <strong>{score}/10</strong>. Thanks for your feedback!</span>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {/* Score slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-600">Your score</label>
                    <span className="text-2xl font-semibold text-[#6384ff]">{score}<span className="text-sm font-normal text-gray-400">/10</span></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full accent-[#6384ff]"
                  />
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Score label */}
                <p className="text-sm text-gray-400 text-center">
                  {score <= 3 ? 'Poor experience' : score <= 5 ? 'Below average' : score <= 7 ? 'Good ride' : score <= 9 ? 'Great driver!' : 'Outstanding!'}
                </p>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  onClick={handleSubmitRating}
                  disabled={submitting}
                  className="w-full px-5 py-2.5 bg-[#6384ff] text-white text-sm font-medium rounded-xl hover:bg-[#4d6ef0] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit rating'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Own profile notice */}
        {isOwnProfile && (
          <div className="text-center">
            <a
              href="/profile"
              className="text-sm text-[#6384ff] hover:underline"
            >
              Edit your profile →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
