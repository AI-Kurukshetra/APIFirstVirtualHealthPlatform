import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { getProviderProfileCompleteness } from "@/lib/provider/profile"
import { NoteStatus } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

export default async function ClinicalDashboardPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical")

  const [
    patientCount,
    pendingNotesCount,
    providerProfile,
    pendingNotes,
  ] = await Promise.all([
    db.user.count({ where: { role: "PATIENT" } }),
    db.clinicalNote.count({
      where: { providerId: user.id, status: NoteStatus.DRAFT },
    }),
    db.providerProfile.findUnique({ where: { userId: user.id } }),
    db.clinicalNote.findMany({
      where: { providerId: user.id, status: NoteStatus.DRAFT },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        patient: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
  ])

  // Fetch recent unique patients from vitals + notes written by this provider
  const [recentVitalPatients, recentNotePatients] = await Promise.all([
    db.vitalSign.findMany({
      where: { recordedById: user.id },
      orderBy: { recordedAt: "desc" },
      take: 20,
      select: {
        patient: {
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
    db.clinicalNote.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        patient: {
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
  ])

  const seen = new Set<string>()
  const recentPatients: Array<{ id: string; firstName: string; lastName: string }> = []

  for (const entry of [...recentNotePatients, ...recentVitalPatients]) {
    const u = entry.patient.user
    if (!seen.has(u.id)) {
      seen.add(u.id)
      recentPatients.push(u)
      if (recentPatients.length >= 5) break
    }
  }

  const completeness = providerProfile
    ? getProviderProfileCompleteness({
        bio: providerProfile.bio,
        education: providerProfile.education,
        languages: providerProfile.languages,
        licenseNumber: providerProfile.licenseNumber,
        npiNumber: providerProfile.npiNumber,
        specialty: providerProfile.specialty,
        title: providerProfile.title,
      })
    : 0

  const NOTE_TYPE_LABELS: Record<string, string> = {
    SOAP: "SOAP",
    PROGRESS: "Progress",
    PROCEDURE_NOTE: "Procedure",
    CONSULTATION: "Consultation",
    DISCHARGE: "Discharge",
    FOLLOW_UP: "Follow-up",
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Clinical
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Good day, {user.firstName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Here&apos;s your clinical workspace overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/clinical/profile">My profile</Link>
            </Button>
            <Button asChild>
              <Link href="/clinical/patients">Patient directory</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total patients
            </div>
            <div className="mt-3 text-3xl font-semibold">{patientCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Pending notes
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {pendingNotesCount}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Today&apos;s appointments
            </div>
            <div className="mt-3 text-3xl font-semibold">0</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile completion
            </div>
            <div className="mt-3 text-3xl font-semibold">{completeness}%</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Unsigned drafts</h2>
          {pendingNotes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No pending drafts. All notes are signed.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {pendingNotes.map((note) => (
                <li key={note.id} className="py-3">
                  <Link
                    href={`/clinical/patients/${note.patient.user.id}/notes/${note.id}`}
                    className="group flex items-center justify-between gap-3"
                  >
                    <div className="grid gap-0.5">
                      <span className="text-sm font-medium group-hover:underline">
                        {note.patient.user.firstName}{" "}
                        {note.patient.user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {NOTE_TYPE_LABELS[note.type] ?? note.type} ·{" "}
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Edit →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent patients</h2>
          {recentPatients.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No recent patient activity. Visit the patient directory to get
              started.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentPatients.map((p) => (
                <li key={p.id} className="py-3">
                  <Link
                    href={`/clinical/patients/${p.id}`}
                    className="group flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium group-hover:underline">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      View →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/clinical/patients">Patient directory</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clinical/templates">Note templates</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clinical/profile">My profile</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
