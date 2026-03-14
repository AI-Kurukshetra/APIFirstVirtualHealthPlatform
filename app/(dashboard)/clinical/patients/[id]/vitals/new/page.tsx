import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { recordVitalsAction } from "../actions"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface NewVitalsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function NewVitalsPage({
  params,
  searchParams,
}: NewVitalsPageProps) {
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

  const action = recordVitalsAction.bind(null, id)

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clinical/patients/${id}/vitals`}>
            ← Back to vitals
          </Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          Record vitals — {patient.firstName} {patient.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All fields are optional. Enter any readings available.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={action} className="mt-6 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="systolicBP" className="text-sm font-medium">
                Systolic BP (mmHg)
              </label>
              <input
                id="systolicBP"
                name="systolicBP"
                type="number"
                step="1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 120"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="diastolicBP" className="text-sm font-medium">
                Diastolic BP (mmHg)
              </label>
              <input
                id="diastolicBP"
                name="diastolicBP"
                type="number"
                step="1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 80"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="heartRate" className="text-sm font-medium">
                Heart rate (bpm)
              </label>
              <input
                id="heartRate"
                name="heartRate"
                type="number"
                step="1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 72"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="temperature" className="text-sm font-medium">
                Temperature (°F)
              </label>
              <input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 98.6"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="respiratoryRate" className="text-sm font-medium">
                Respiratory rate (breaths/min)
              </label>
              <input
                id="respiratoryRate"
                name="respiratoryRate"
                type="number"
                step="1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 16"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="oxygenSaturation" className="text-sm font-medium">
                O₂ saturation (%)
              </label>
              <input
                id="oxygenSaturation"
                name="oxygenSaturation"
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 98"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="weight" className="text-sm font-medium">
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 70.5"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="height" className="text-sm font-medium">
                Height (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min="0"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 170"
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
              rows={3}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any additional observations..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save vitals</Button>
            <Button asChild variant="outline">
              <Link href={`/clinical/patients/${id}/vitals`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
