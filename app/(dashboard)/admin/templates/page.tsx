import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { NoteType } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

const NOTE_TYPE_LABELS: Record<string, string> = {
  SOAP: "SOAP",
  PROGRESS: "Progress",
  PROCEDURE_NOTE: "Procedure",
  CONSULTATION: "Consultation",
  DISCHARGE: "Discharge",
  FOLLOW_UP: "Follow-up",
}

async function toggleSystemTemplateAction(templateId: string, isSystem: boolean) {
  "use server"

  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "system:configure")

  const template = await db.noteTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, name: true },
  })

  if (!template) {
    redirect("/admin/templates?error=Template+not+found.")
  }

  await db.noteTemplate.update({
    where: { id: templateId },
    data: { isSystem },
  })

  await logAudit({
    action: isSystem ? "TEMPLATE_PROMOTED_SYSTEM" : "TEMPLATE_DEMOTED_SYSTEM",
    entity: "NoteTemplate",
    entityId: templateId,
    userId: actor.id,
    details: { name: template.name, isSystem },
  })

  redirect(
    `/admin/templates?message=${encodeURIComponent(
      isSystem ? "Template promoted to system template." : "Template removed from system templates."
    )}`
  )
}

async function deleteTemplateAction(templateId: string) {
  "use server"

  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "system:configure")

  const template = await db.noteTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, name: true },
  })

  if (!template) {
    redirect("/admin/templates?error=Template+not+found.")
  }

  await db.noteTemplate.delete({ where: { id: templateId } })

  await logAudit({
    action: "TEMPLATE_DELETED",
    entity: "NoteTemplate",
    entityId: templateId,
    userId: actor.id,
    details: { name: template.name },
  })

  redirect("/admin/templates?message=Template+deleted.")
}

interface AdminTemplatesPageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function AdminTemplatesPage({
  searchParams,
}: AdminTemplatesPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/admin")
  requirePermission(currentUser.role, "system:configure")

  const { message, error } = await searchParams

  const [systemTemplates, providerTemplates] = await Promise.all([
    db.noteTemplate.findMany({
      where: { isSystem: true },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { name: "asc" },
    }),
    db.noteTemplate.findMany({
      where: { isSystem: false },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    }),
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
              Note templates
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Manage system-wide note templates visible to all providers. Promote
              provider templates to system-level or remove them.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </div>

        {message ? (
          <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              System templates
            </div>
            <div className="mt-3 text-3xl font-semibold">{systemTemplates.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Provider templates
            </div>
            <div className="mt-3 text-3xl font-semibold">{providerTemplates.length}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">System templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visible to all providers when creating notes.
        </p>
        <div className="mt-5">
          {systemTemplates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No system templates yet. Promote a provider template below.
            </p>
          ) : (
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
                    </div>
                    {t.specialty && (
                      <div className="text-xs text-muted-foreground">{t.specialty}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {t.createdBy
                        ? `Created by ${t.createdBy.firstName} ${t.createdBy.lastName}`
                        : "System"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleSystemTemplateAction.bind(null, t.id, false)}>
                      <Button type="submit" variant="outline" size="sm">
                        Remove from system
                      </Button>
                    </form>
                    <form action={deleteTemplateAction.bind(null, t.id)}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Provider templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Templates created by individual providers. Promote to make system-wide.
        </p>
        <div className="mt-5">
          {providerTemplates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No provider templates yet.
            </p>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border">
              {providerTemplates.map((t) => (
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
                      <div className="text-xs text-muted-foreground">{t.specialty}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {t.createdBy
                        ? `${t.createdBy.firstName} ${t.createdBy.lastName}`
                        : "Unknown provider"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleSystemTemplateAction.bind(null, t.id, true)}>
                      <Button type="submit" variant="outline" size="sm">
                        Promote to system
                      </Button>
                    </form>
                    <form action={deleteTemplateAction.bind(null, t.id)}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
