'use client'

import { createClient } from '../../utils/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center p-8">
      <div className="w-full max-w-3xl grid grid-cols-2 rounded-2xl overflow-hidden shadow-2xl">

        {/* Left branding panel */}
        <div className="relative bg-[#1a1a2e] p-12 flex flex-col justify-between overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute w-72 h-72 rounded-full bg-[#6384ff1f] -top-20 -right-20" />
          <div className="absolute w-48 h-48 rounded-full bg-[#6384ff12] bottom-10 -left-14" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#6384ff] rounded-xl flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9C3 5.686 5.686 3 9 3s6 2.686 6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="9" r="2" fill="#fff" />
                <path d="M9 11v4M7 14h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-serif text-xl text-white tracking-tight">Eventogether</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10">
            <p className="text-[11px] tracking-widest uppercase text-[#6384ff] mb-3 font-medium">
              Community rides
            </p>
            <h2 className="text-3xl text-white leading-snug mb-3 font-normal font-serif">
              Go further,<br /><em>together.</em>
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Join events, share rides, and connect with people headed your way.
            </p>
          </div>

          {/* Dots */}
          <div className="relative z-10 flex gap-1.5">
            <div className="w-4 h-1.5 rounded-sm bg-[#6384ff]" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Right sign-in panel */}
        <div className="bg-white px-10 py-12 flex flex-col justify-center items-center text-center">
          <h1 className="text-2xl font-normal text-gray-900 mb-1 font-serif tracking-tight">
            Welcome
          </h1>
          <p className="text-sm text-gray-400 mb-10">Sign in to get started</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-gray-400 leading-relaxed max-w-[220px]">
            By continuing, you agree to our{' '}
            <a href="#" className="text-[#6384ff] hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#6384ff] hover:underline">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  )
}