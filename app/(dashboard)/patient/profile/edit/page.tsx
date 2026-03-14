import Link from "next/link"

import { SubmitButton } from "@/components/auth/submit-button"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import {
  formatDateInput,
  readJsonField,
  stringifyAllergies,
  stringifyMedications,
} from "@/lib/patient/profile"

export const dynamic = "force-dynamic"

interface PatientProfileEditPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const inputClassName =
  "h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"

const textAreaClassName =
  "min-h-32 rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"

export default async function PatientProfileEditPage({
  searchParams,
}: PatientProfileEditPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/profile")

  const [params, patient] = await Promise.all([
    searchParams,
    db.user.findUnique({
      where: { id: user.id },
      include: {
        patientProfile: {
          include: {
            allergies: true,
            medications: true,
          },
        },
      },
    }),
  ])

  const error = typeof params.error === "string" ? params.error : undefined
  const { updatePatientProfileAction } = await import(
    "@/app/(dashboard)/patient/actions"
  )

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
              Edit profile
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Update demographics, emergency contact, allergies, and current
              medications.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/patient/profile">Back to profile</Link>
          </Button>
        </div>

        <form action={updatePatientProfileAction} className="mt-8 grid gap-5">
          <input name="redirectTo" type="hidden" value="/patient/profile" />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Date of birth
              <input
                className={inputClassName}
                defaultValue={formatDateInput(patient.patientProfile?.dateOfBirth)}
                name="dateOfBirth"
                type="date"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Phone
              <input
                className={inputClassName}
                defaultValue={patient.phone ?? ""}
                name="phone"
                type="tel"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Gender
              <input
                className={inputClassName}
                defaultValue={patient.patientProfile?.gender ?? ""}
                name="gender"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Blood type
              <input
                className={inputClassName}
                defaultValue={patient.patientProfile?.bloodType ?? ""}
                name="bloodType"
                type="text"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Address line 1
              <input
                className={inputClassName}
                defaultValue={readJsonField(patient.patientProfile?.address, "line1")}
                name="line1"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Address line 2
              <input
                className={inputClassName}
                defaultValue={readJsonField(patient.patientProfile?.address, "line2")}
                name="line2"
                type="text"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-2 text-sm font-medium">
              City
              <input
                className={inputClassName}
                defaultValue={readJsonField(patient.patientProfile?.address, "city")}
                name="city"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              State
              <input
                className={inputClassName}
                defaultValue={readJsonField(patient.patientProfile?.address, "state")}
                name="state"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Postal code
              <input
                className={inputClassName}
                defaultValue={readJsonField(
                  patient.patientProfile?.address,
                  "postalCode"
                )}
                name="postalCode"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Country
              <input
                className={inputClassName}
                defaultValue={readJsonField(
                  patient.patientProfile?.address,
                  "country"
                )}
                name="country"
                type="text"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium">
              Emergency contact
              <input
                className={inputClassName}
                defaultValue={readJsonField(
                  patient.patientProfile?.emergencyContact,
                  "name"
                )}
                name="emergencyName"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Relationship
              <input
                className={inputClassName}
                defaultValue={readJsonField(
                  patient.patientProfile?.emergencyContact,
                  "relationship"
                )}
                name="emergencyRelationship"
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Emergency phone
              <input
                className={inputClassName}
                defaultValue={readJsonField(
                  patient.patientProfile?.emergencyContact,
                  "phone"
                )}
                name="emergencyPhone"
                type="tel"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Known allergies
            <textarea
              className={textAreaClassName}
              defaultValue={stringifyAllergies(patient.patientProfile?.allergies ?? [])}
              name="allergies"
              placeholder="One per line: allergen | severity | reaction | notes"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Current medications
            <textarea
              className={textAreaClassName}
              defaultValue={stringifyMedications(
                patient.patientProfile?.medications ?? []
              )}
              name="medications"
              placeholder="One per line: medication | dosage | frequency | prescribed by"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="max-w-56">
            <SubmitButton>Save profile</SubmitButton>
          </div>
        </form>
      </div>
    </section>
  )
}
