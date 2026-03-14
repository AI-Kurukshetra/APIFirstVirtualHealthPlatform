import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PatientSummaryCard } from "@/components/patient/summary-card"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { formatJsonSummary } from "@/lib/patient/profile"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface ClinicalPatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClinicalPatientDetailPage({
  params,
}: ClinicalPatientDetailPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/clinical/patients")

  const { id } = await params
  const patient = await db.user.findFirst({
    where: {
      id,
      role: Role.PATIENT,
    },
    include: {
      patientProfile: {
        include: {
          allergies: true,
          medications: true,
        },
      },
    },
  })

  if (!patient) {
    notFound()
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/clinical/patients">Back to patient directory</Link>
        </Button>
      </div>

      <PatientSummaryCard
        href="/clinical/patients"
        hrefLabel="Back to directory"
        patient={patient}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Demographics</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{patient.phone || "Not provided"}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Gender</dt>
              <dd>{patient.patientProfile?.gender || "Not provided"}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Blood type</dt>
              <dd>{patient.patientProfile?.bloodType || "Not provided"}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Address</dt>
              <dd>{formatJsonSummary(patient.patientProfile?.address)}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Emergency contact</dt>
              <dd>{formatJsonSummary(patient.patientProfile?.emergencyContact)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Medical basics</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="font-medium">Allergies</div>
              <ul className="mt-3 grid gap-2 text-muted-foreground">
                {patient.patientProfile?.allergies.length ? (
                  patient.patientProfile.allergies.map((allergy) => (
                    <li key={allergy.id}>
                      {allergy.allergen} · {allergy.severity}
                    </li>
                  ))
                ) : (
                  <li>None documented</li>
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="font-medium">Medications</div>
              <ul className="mt-3 grid gap-2 text-muted-foreground">
                {patient.patientProfile?.medications.length ? (
                  patient.patientProfile.medications.map((medication) => (
                    <li key={medication.id}>
                      {medication.name}
                      {medication.dosage ? ` · ${medication.dosage}` : ""}
                      {medication.frequency ? ` · ${medication.frequency}` : ""}
                    </li>
                  ))
                ) : (
                  <li>None documented</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
