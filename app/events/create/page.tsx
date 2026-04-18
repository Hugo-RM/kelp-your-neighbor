const eventFields = [
  "Event name",
  "Date and time",
  "Location",
  "Description",
  "Capacity",
  "Visibility",
];

export default function EventCreatePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#f6f4ed_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <a href="/" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Back to home
          </a>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-amber-700">
              Event creation scaffold
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Create a neighborhood event
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This is a static form layout for the event branch. The structure
              is ready for validation, image upload, and publish actions later.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-amber-700">Form layout</p>
                <h2 className="mt-1 text-2xl font-semibold">Event details</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Static
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {eventFields.map((field) => (
                <label key={field} className={field === "Description" ? "sm:col-span-2" : ""}>
                  <span className="mb-2 block text-sm font-medium text-slate-700">{field}</span>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400 shadow-inner">
                    {field}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Need a banner?</p>
                <p className="mt-2 text-sm text-slate-500">Drop area placeholder</p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Need tags?</p>
                <p className="mt-2 text-sm text-slate-500">Tag chips placeholder</p>
              </div>
            </div>

            <button className="mt-6 w-full rounded-2xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
              Publish event
            </button>
          </section>

          <aside className="grid gap-4 rounded-[2rem] border border-amber-100 bg-amber-50/80 p-6 shadow-[0_24px_70px_rgba(251,191,36,0.14)]">
            <div>
              <p className="text-sm font-medium text-amber-700">Branch split</p>
              <h2 className="mt-1 text-2xl font-semibold">Parallel work area</h2>
            </div>

            <div className="grid gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                Build event metadata inputs and layout polish
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                Add photo upload and preview placeholders
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                Hook publish flow to API or database later
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                Reuse this branch as the starting point for scheduling logic
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}