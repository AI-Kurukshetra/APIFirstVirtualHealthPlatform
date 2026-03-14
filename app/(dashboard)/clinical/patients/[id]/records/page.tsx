import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface RecordsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string; error?: string }>
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  VITALS: "Vitals",
  DIAGNOSIS: "Diagnosis",
  PROCEDURE: "Procedure",
  MEDICAL_HISTORY: "Medical history",
  FAMILY_HISTORY: "Family history",
  SURGICAL_HISTORY: "Surgical history",
  SOCIAL_HISTORY: "Social history",
  IMMUNIZATION: "Immunization",
}

const RECORD_TYPE_COLORS: Record<string, string> = {
  VITALS: "bg-blue-100 text-blue-800",
  DIAGNOSIS: "bg-red-100 text-red-800",
  PROCEDURE: "bg-purple-100 text-purple-800",
  MEDICAL_HISTORY: "bg-gray-100 text-gray-800",
  FAMILY_HISTORY: "bg-yellow-100 text-yellow-800",
  SURGICAL_HISTORY: "bg-orange-100 text-orange-800",
  SOCIAL_HISTORY: "bg-teal-100 text-teal-800",
  IMMUNIZATION: "bg-green-100 text-green-800",
}

export default async function RecordsPage({
  params,
  searchParams,
}: RecordsPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "vitals:read")

  const { id } = await params
  const { message, error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    include: {
      patientProfile: {
        include: {
          medicalRecords: {
            orderBy: { date: "desc" },
            include: {
              provider: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  })

  if (!patient) notFound()

  const records = patient.patientProfile?.medicalRecords ?? []

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
          <Link href={`/clinical/patients/${id}/records/new`}>Add record</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Medical records — {patient.firstName} {patient.lastName}
        </h1>

        {records.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No medical records yet. Use the button above to add the first entry.
          </div>
        ) : (
          <ol className="mt-6 grid gap-4">
            {records.map((record, index) => (
              <li key={record.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-muted-foreground">
                    {records.length - index}
                  </div>
                  {index < records.length - 1 && (
                    <div className="mt-2 w-px grow bg-border" />
                  )}
                </div>
                <div className="mb-4 flex-1 rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RECORD_TYPE_COLORS[record.type] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {RECORD_TYPE_LABELS[record.type] ?? record.type}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm">{record.notes}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {record.provider.firstName} {record.provider.lastName}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
