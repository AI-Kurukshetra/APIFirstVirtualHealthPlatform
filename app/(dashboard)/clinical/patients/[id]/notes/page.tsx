import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { NoteStatus, Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NotesPageProps {
  params: Promise<{ id: string }>
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

function NoteStatusBadge({ status }: { status: NoteStatus }) {
  if (status === NoteStatus.DRAFT) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Signed
    </span>
  )
}

export default async function NotesPage({
  params,
  searchParams,
}: NotesPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "notes:create")

  const { id } = await params
  const { message, error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    include: {
      patientProfile: {
        include: {
          clinicalNotes: {
            orderBy: { createdAt: "desc" },
            include: {
              provider: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  })

  if (!patient) notFound()

  const allNotes = patient.patientProfile?.clinicalNotes ?? []
  const drafts = allNotes.filter((n) => n.status === NoteStatus.DRAFT)
  const signed = allNotes.filter((n) => n.status !== NoteStatus.DRAFT)

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
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}`}>
            ← Back to {patient.firstName} {patient.lastName}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/clinical/patients/${id}/notes/new`}>New note</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Notes — {patient.firstName} {patient.lastName}
        </h1>

        {allNotes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No clinical notes yet. Use the button above to create the first note.
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            {drafts.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Unsigned drafts
                </h2>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {drafts.map((note) => (
                    <Link
                      key={note.id}
                      href={`/clinical/patients/${id}/notes/${note.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {NOTE_TYPE_LABELS[note.type] ?? note.type}
                          </span>
                          <NoteStatusBadge status={note.status} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {note.provider.firstName} {note.provider.lastName} ·{" "}
                          {new Date(note.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">View →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {signed.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Signed notes
                </h2>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {signed.map((note) => (
                    <Link
                      key={note.id}
                      href={`/clinical/patients/${id}/notes/${note.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {NOTE_TYPE_LABELS[note.type] ?? note.type}
                          </span>
                          <NoteStatusBadge status={note.status} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {note.provider.firstName} {note.provider.lastName} ·{" "}
                          {new Date(note.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {note.signedAt && (
                            <>
                              {" "}
                              · Signed{" "}
                              {new Date(note.signedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">View →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
