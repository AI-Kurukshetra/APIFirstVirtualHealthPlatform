interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-[radial-gradient(circle_at_top,_rgba(33,92,178,0.24),_transparent_48%),linear-gradient(160deg,_rgba(10,15,28,1),_rgba(12,27,59,1)_60%,_rgba(19,79,133,1))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Healthie Platform
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Clinical operations with a secure, permission-first foundation.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-white/70">
            App Router, Supabase Auth, Prisma, and role-aware access control
            aligned to your phase plan.
          </p>
        </div>
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="text-sm text-white/70">Security defaults</div>
          <ul className="grid gap-3 text-sm text-white/90">
            <li>Cookie-based Supabase session refresh in middleware</li>
            <li>Server-side permission checks backed by Prisma roles</li>
            <li>Audit log hooks for auth lifecycle events</li>
          </ul>
        </div>
      </section>
      <section className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  )
}
