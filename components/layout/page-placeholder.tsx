interface PagePlaceholderProps {
  eyebrow: string
  title: string
  description: string
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Production guardrails</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Authentication, server-side permissions, and audit hooks are in
            place before deeper feature work starts.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Schema-first delivery</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The Prisma models already cover downstream phases, so the app layer
            can grow without reworking the database.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Next up</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Replace placeholders with phase-specific workflows as each feature
            moves from pending into active delivery.
          </p>
        </div>
      </div>
    </section>
  )
}
