"use client";

export default function HeroSection() {
  const scrollToMap = () => {
    document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_34%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)] text-slate-900 text-center px-6">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <span className="text-lg font-bold tracking-tight text-emerald-800">Kelp Your Neighbor</span>
        <a href="/login" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700">
          Login
        </a>
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
