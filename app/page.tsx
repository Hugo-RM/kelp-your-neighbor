export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_34%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium tracking-wide text-emerald-900 shadow-sm backdrop-blur">
              Static branch scaffold
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Kelp Your Neighbor
              </h1>
              
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/auth"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                Open login / register
              </a>
              <a
                href="/events/create"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                Open event creation
              </a>
            </div>
          </section>

            
        </div>
      </div>
    </main>
  );
}
