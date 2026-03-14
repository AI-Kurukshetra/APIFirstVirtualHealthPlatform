import Link from "next/link"

import { Prisma } from "@/prisma/generated/client"

import { Button } from "@/components/ui/button"
import {
  calculateAge,
  formatJsonSummary,
  getPatientProfileCompleteness,
} from "@/lib/patient/profile"

interface PatientSummaryCardProps {
  patient: {
    email: string
    firstName: string
    id: string
    lastName: string
    patientProfile: {
      address: Prisma.JsonValue | null
      allergies: Array<{ id: string }>
      dateOfBirth: Date | null
      emergencyContact: Prisma.JsonValue | null
      gender: string | null
      medications: Array<{ id: string }>
      onboardingCompleted: boolean
    } | null
  }
  href: string
  hrefLabel?: string
}

export function PatientSummaryCard({
  patient,
  href,
  hrefLabel = "View profile",
}: PatientSummaryCardProps) {
  const profile = patient.patientProfile
  const completeness = profile
    ? getPatientProfileCompleteness({
        address: profile.address,
        allergiesCount: profile.allergies.length,
        dateOfBirth: profile.dateOfBirth,
        emergencyContact: profile.emergencyContact,
        gender: profile.gender,
        medicationsCount: profile.medications.length,
      })
    : 0
  const age = calculateAge(profile?.dateOfBirth)

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{patient.email}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={href}>{hrefLabel}</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Age
          </div>
          <div className="mt-2 text-lg font-semibold">
            {age === null ? "Not set" : age}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Onboarding
          </div>
          <div className="mt-2 text-lg font-semibold">
            {profile?.onboardingCompleted ? "Complete" : "In progress"}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Allergies
          </div>
          <div className="mt-2 text-lg font-semibold">
            {profile?.allergies.length ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Completeness
          </div>
          <div className="mt-2 text-lg font-semibold">{completeness}%</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
        <div>
          <div className="font-medium text-foreground">Address</div>
          <div className="mt-1">{formatJsonSummary(profile?.address)}</div>
        </div>
        <div>
          <div className="font-medium text-foreground">Emergency contact</div>
          <div className="mt-1">{formatJsonSummary(profile?.emergencyContact)}</div>
        </div>
      </div>
    </article>
  )
}
