"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export default function HeroSection() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        setFullName(user.user_metadata?.full_name || user.email || "");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleSignOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.replace("/");
};

  const scrollToMap = () => {
    document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const firstName = fullName.split(" ")[0];

  return (
    <section className="relative flex h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_34%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)] text-slate-900 text-center px-6">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <span className="text-lg font-bold tracking-tight text-emerald-800">Kelp Your Neighbor</span>

        {/* Not logged in — show Login button */}
        {!isLoggedIn && (
          <a href="/auth" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700">
            Login
          </a>
        )}

        {/* Logged in — show avatar + name + dropdown */}
        {isLoggedIn && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full bg-white border border-gray-200 pl-1 pr-3 py-1 shadow-sm hover:shadow-md transition"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              )}
              <span className="text-sm font-medium text-slate-700">{firstName}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                <a 
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-gray-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                  Account Settings
                </a>
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero content */}
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <span className="w-fit rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium tracking-wide text-emerald-900 shadow-sm backdrop-blur">
          Monterey Bay Community
        </span>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight">
          Discover events<br />
          <span className="text-emerald-600">near the bay.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md">
          Find local music, food, sports, and community events happening around Monterey Bay — and share the ride.
        </p>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          <button
            onClick={scrollToMap}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
          >
            Explore the map
          </button>
          <a
            href="/events/create"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Add an event
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={scrollToMap}
        aria-label="Scroll to map"
        className="absolute bottom-8 flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}