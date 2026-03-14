import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { saveNoteAction } from "../actions"
import { NoteType, Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NewNotePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; templateId?: string }>
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  SOAP: "SOAP",
  PROGRESS: "Progress note",
  PROCEDURE_NOTE: "Procedure note",
  CONSULTATION: "Consultation",
  DISCHARGE: "Discharge summary",
  FOLLOW_UP: "Follow-up",
}

export default async function NewNotePage({
  params,
  searchParams,
}: NewNotePageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "notes:create")

  const { id } = await params
  const { error, templateId } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    select: { id: true, firstName: true, lastName: true },
  })

  if (!patient) notFound()

  let template: {
    type: NoteType
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
  } | null = null

  if (templateId) {
    template = await db.noteTemplate.findUnique({
      where: { id: templateId },
      select: {
        type: true,
        subjective: true,
        objective: true,
        assessment: true,
        plan: true,
      },
    })
  }

  const action = saveNoteAction.bind(null, id)
  const noteTypes = Object.values(NoteType)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/notes`}>
            ← Back to notes
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          New note — {patient.firstName} {patient.lastName}
        </h1>
        {template && (
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-populated from template.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={action} className="mt-6 grid gap-5">
          <div className="grid gap-1.5">
            <label htmlFor="type" className="text-sm font-medium">
              Note type <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={template?.type ?? "SOAP"}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {noteTypes.map((t) => (
                <option key={t} value={t}>
                  {NOTE_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="subjective" className="text-sm font-medium">
              Subjective
            </label>
            <textarea
              id="subjective"
              name="subjective"
              rows={4}
              defaultValue={template?.subjective ?? ""}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Patient's chief complaint, history of present illness..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="objective" className="text-sm font-medium">
              Objective
            </label>
            <textarea
              id="objective"
              name="objective"
              rows={4}
              defaultValue={template?.objective ?? ""}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Physical exam findings, vital signs, lab results..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="assessment" className="text-sm font-medium">
              Assessment
            </label>
            <textarea
              id="assessment"
              name="assessment"
              rows={4}
              defaultValue={template?.assessment ?? ""}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Clinical impression, diagnosis..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="plan" className="text-sm font-medium">
              Plan
            </label>
            <textarea
              id="plan"
              name="plan"
              rows={4}
              defaultValue={template?.plan ?? ""}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Treatment plan, follow-up instructions, referrals..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save as draft</Button>
            <Button asChild variant="outline">
              <Link href={`/clinical/patients/${id}/notes`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
