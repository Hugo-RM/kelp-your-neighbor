const loginFields = ["Email address", "Password"];

const registerFields = ["Full name", "Email address", "Password", "Neighborhood"];

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f7fbff_0%,_#eef6f2_52%,_#fff8ec_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <a href="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Back to home
          </a>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-700">
              Authentication scaffold
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Login and register
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Static layout only. This page is ready for form logic, validation,
              and auth integration to be added later by one branch.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Login</p>
                <h2 className="mt-1 text-2xl font-semibold">Welcome back</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Static
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {loginFields.map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{field}</span>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400 shadow-inner">
                    {field}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-500">Remember me</span>
              <span className="text-sm font-medium text-emerald-700">Forgot password?</span>
            </div>

            <button className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Sign in
            </button>
          </section>

          <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50/80 p-6 shadow-[0_24px_70px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Register</p>
                <h2 className="mt-1 text-2xl font-semibold">Create your account</h2>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                Static
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {registerFields.map((field) => (
                <label key={field} className={field === "Neighborhood" ? "sm:col-span-2" : ""}>
                  <span className="mb-2 block text-sm font-medium text-slate-700">{field}</span>
                  <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-slate-400 shadow-inner">
                    {field}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-white/70 p-4 text-sm leading-6 text-slate-600">
              Future branch owners can wire email verification, password rules,
              and provider login here without touching the event creation route.
            </div>

            <button className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Create account
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}