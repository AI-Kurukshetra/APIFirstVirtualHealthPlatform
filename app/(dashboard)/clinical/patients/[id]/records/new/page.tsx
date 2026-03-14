import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { addMedicalRecordAction } from "../actions"
import { RecordType, Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NewRecordPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
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

export default async function NewRecordPage({
  params,
  searchParams,
}: NewRecordPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")
  requirePermission(currentUser.role, "vitals:create")

  const { id } = await params
  const { error } = await searchParams

  const patient = await db.user.findFirst({
    where: { id, role: Role.PATIENT },
    select: { id: true, firstName: true, lastName: true },
  })

  if (!patient) notFound()

  const action = addMedicalRecordAction.bind(null, id)
  const recordTypes = Object.values(RecordType)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/records`}>
            ← Back to records
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Add record — {patient.firstName} {patient.lastName}
        </h1>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={action} className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a type...</option>
                {recordTypes.map((t) => (
                  <option key={t} value={t}>
                    {RECORD_TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Clinical notes for this record..."
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="data" className="text-sm font-medium">
              Additional data — free text{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="data"
              name="data"
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder='JSON or plain text, e.g. {"result": "normal"}'
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Add record</Button>
            <Button asChild variant="outline">
              <Link href={`/clinical/patients/${id}/records`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
