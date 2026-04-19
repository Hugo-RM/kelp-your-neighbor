"use client";

import Link from "next/link";

export default function MapPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef6f2_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.10)]">
        <h1 className="text-3xl font-semibold tracking-tight">Event created</h1>
        <p className="mt-4 text-slate-600">
          Your event has been successfully created and is now visible to Monterey County.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-400/35 transition hover:bg-amber-400"
          >
            Return to home
          </Link>
        </div>
      </div>
    </main>
  );
}
