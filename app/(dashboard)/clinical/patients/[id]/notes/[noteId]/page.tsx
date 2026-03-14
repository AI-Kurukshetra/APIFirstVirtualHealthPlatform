import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { BreadcrumbLabel } from "@/components/layout/breadcrumb-label"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { signNoteAction, deleteNoteAction } from "../actions"
import { NoteStatus } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NoteDetailPageProps {
  params: Promise<{ id: string; noteId: string }>
  searchParams: Promise<{ message?: string; error?: string }>
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  SOAP: "SOAP",
  PROGRESS: "Progress note",
  PROCEDURE_NOTE: "Procedure note",
  CONSULTATION: "Consultation",
  DISCHARGE: "Discharge summary",
  FOLLOW_UP: "Follow-up",
}

export default async function NoteDetailPage({
  params,
  searchParams,
}: NoteDetailPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "notes:create")

  const { id, noteId } = await params
  const { message, error } = await searchParams

  const note = await db.clinicalNote.findUnique({
    where: { id: noteId },
    include: {
      provider: { select: { firstName: true, lastName: true } },
      patient: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!note || note.patient.user.id !== id) notFound()

  const isDraft = note.status === NoteStatus.DRAFT
  const redirectTo = `/clinical/patients/${id}/notes/${noteId}`

  const signAction = signNoteAction.bind(null, noteId, redirectTo)
  const deleteAction = deleteNoteAction.bind(null, noteId, id)

  return (
    <section className="grid gap-6">
      <BreadcrumbLabel segment={id} label={`${note.patient.user.firstName} ${note.patient.user.lastName}`} />
      <BreadcrumbLabel segment={noteId} label={NOTE_TYPE_LABELS[note.type] ?? note.type} />
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
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/notes`}>
            ← Back to notes
          </Link>
        </Button>
        {isDraft && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/clinical/patients/${id}/notes/${noteId}/edit`}>
                Edit
              </Link>
            </Button>
            <form action={signAction}>
              <Button type="submit" size="sm">
                Sign note
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {NOTE_TYPE_LABELS[note.type] ?? note.type}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {note.provider.firstName} {note.provider.lastName} ·{" "}
              {new Date(note.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDraft ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                Draft
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Signed
              </span>
            )}
          </div>
        </div>

        {note.signedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Signed{" "}
            {new Date(note.signedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            by {note.provider.firstName} {note.provider.lastName}
          </p>
        )}

        <div className="mt-6 grid gap-5">
          <div className="rounded-2xl border border-border bg-background p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Subjective
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {note.subjective || (
                <span className="text-muted-foreground">Not recorded</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Objective
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {note.objective || (
                <span className="text-muted-foreground">Not recorded</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Assessment
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {note.assessment || (
                <span className="text-muted-foreground">Not recorded</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Plan
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {note.plan || (
                <span className="text-muted-foreground">Not recorded</span>
              )}
            </p>
          </div>
        </div>

        {isDraft && (
          <div className="mt-6 border-t border-border pt-6">
            <form action={deleteAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                Delete draft
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
