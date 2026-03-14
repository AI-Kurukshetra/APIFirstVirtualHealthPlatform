import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { Role } from "@/prisma/generated/client"

export default async function AdminPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin")

  const [userCount, providerCount, patientCount, auditCount] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: Role.PROVIDER } }),
    db.user.count({ where: { role: Role.PATIENT } }),
    db.auditLog.count(),
  ])

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Operational oversight
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Phase 2 turns admin oversight into working user, provider, and
              patient management workflows.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Users
            </div>
            <div className="mt-3 text-3xl font-semibold">{userCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Providers
            </div>
            <div className="mt-3 text-3xl font-semibold">{providerCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Patients
            </div>
            <div className="mt-3 text-3xl font-semibold">{patientCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Audit events
            </div>
            <div className="mt-3 text-3xl font-semibold">{auditCount}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Create, edit, and deactivate system accounts with role-aware access.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/admin/users">Open users</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Providers</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Review provider readiness, specialties, and directory completeness.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/admin/providers">Open providers</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Patients</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Monitor onboarding progress and access patient demographic profiles.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/admin/patients">Open patients</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Audit trail</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Review auth and administrative activity with immutable audit logs.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/admin/audit-logs">Open audit log</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
