import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"

export const dynamic = "force-dynamic"

interface TemplatesPageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  SOAP: "SOAP",
  PROGRESS: "Progress",
  PROCEDURE_NOTE: "Procedure",
  CONSULTATION: "Consultation",
  DISCHARGE: "Discharge",
  FOLLOW_UP: "Follow-up",
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical")
  requirePermission(currentUser.role, "notes:create")

  const { message, error } = await searchParams

  const [myTemplates, systemTemplates] = await Promise.all([
    db.noteTemplate.findMany({
      where: { createdById: currentUser.id, isSystem: false },
      orderBy: { createdAt: "desc" },
    }),
    db.noteTemplate.findMany({
      where: { isSystem: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <section className="grid gap-6">
      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/clinical">← Clinical dashboard</Link>
          </Button>
        </div>
        <Button asChild>
          <Link href="/clinical/templates/new">New template</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Note templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use templates to pre-populate new notes. Select a template when
          creating a note.
        </p>

        <div className="mt-6 grid gap-6">
          {myTemplates.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                My templates
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border">
                {myTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {NOTE_TYPE_LABELS[t.type] ?? t.type}
                        </span>
                      </div>
                      {t.specialty && (
                        <div className="text-xs text-muted-foreground">
                          {t.specialty}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/clinical/patients`}
                          title="Browse to a patient to use this template"
                        >
                          Use
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {systemTemplates.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                System templates
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border">
                {systemTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {NOTE_TYPE_LABELS[t.type] ?? t.type}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          System
                        </span>
                      </div>
                      {t.specialty && (
                        <div className="text-xs text-muted-foreground">
                          {t.specialty}
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/clinical/patients">Use</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myTemplates.length === 0 && systemTemplates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No templates yet. Create your first template to speed up note
              writing.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
