import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PatientSummaryCard } from "@/components/patient/summary-card"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientDashboardPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient")

  const patient = await db.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          allergies: { select: { id: true } },
          medications: { select: { id: true } },
        },
      },
    },
  })

  if (!patient) {
    return null
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Patient
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Patient dashboard
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Review onboarding progress and keep your demographic and medical
              basics current.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/patient/profile">View profile</Link>
            </Button>
            {!patient.patientProfile?.onboardingCompleted ? (
              <Button asChild>
                <Link href="/patient/onboarding">Finish onboarding</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <PatientSummaryCard
        href={
          patient.patientProfile?.onboardingCompleted
            ? "/patient/profile"
            : "/patient/onboarding"
        }
        hrefLabel={
          patient.patientProfile?.onboardingCompleted
            ? "Open profile"
            : "Continue onboarding"
        }
        patient={patient}
      />
    </section>
  )
}
