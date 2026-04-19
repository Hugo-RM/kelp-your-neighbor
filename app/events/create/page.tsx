import EventCreateForm from "./event-create-form";

export const dynamic = 'force-dynamic';

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
              Community flare form
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Create a neighborhood flare
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This form is ready for production wiring with Supabase and a map-based
              location picker.
            </p>
          </div>
        </div>

        <EventCreateForm />
      </div>
    </main>
  );
}