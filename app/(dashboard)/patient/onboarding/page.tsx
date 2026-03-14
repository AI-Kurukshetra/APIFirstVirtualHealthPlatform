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

interface PatientOnboardingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const inputClassName =
  "h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"

const textAreaClassName =
  "min-h-32 rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"

function clampStep(value: number) {
  return Math.min(3, Math.max(1, value))
}

export default async function PatientOnboardingPage({
  searchParams,
}: PatientOnboardingPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/onboarding")

  const [params, profile] = await Promise.all([
    searchParams,
    db.patientProfile.findUnique({
      where: { userId: user.id },
      include: {
        allergies: true,
        medications: true,
      },
    }),
  ])

  const step = clampStep(
    Number(typeof params.step === "string" ? params.step : "1") || 1
  )
  const error = typeof params.error === "string" ? params.error : undefined
  const { savePatientOnboardingStepAction } = await import(
    "@/app/(dashboard)/patient/actions"
  )

  if (profile?.onboardingCompleted) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Patient
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Onboarding already complete
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            Your onboarding data is already on file. You can review or edit it
            from your profile at any time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/patient">Go to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/patient/profile">Open profile</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Patient
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Onboarding
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Complete the three-step intake flow so your care team has the basic
          demographic and medical information needed to begin.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((currentStep) => (
            <div
              className={
                currentStep === step
                  ? "rounded-2xl border border-primary bg-primary/10 px-4 py-4 text-sm font-medium text-primary"
                  : "rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground"
              }
              key={currentStep}
            >
              Step {currentStep}
            </div>
          ))}
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 max-w-3xl">
          {step === 1 ? (
            <form action={savePatientOnboardingStepAction} className="grid gap-5">
              <input name="step" type="hidden" value="1" />
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Date of birth
                  <input
                    className={inputClassName}
                    defaultValue={formatDateInput(profile?.dateOfBirth)}
                    name="dateOfBirth"
                    type="date"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Gender
                  <input
                    className={inputClassName}
                    defaultValue={profile?.gender ?? ""}
                    name="gender"
                    placeholder="Female, Male, Non-binary"
                    type="text"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Blood type
                  <input
                    className={inputClassName}
                    defaultValue={profile?.bloodType ?? ""}
                    name="bloodType"
                    placeholder="O+, A-, AB+"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Phone
                  <input
                    className={inputClassName}
                    defaultValue={user.phone ?? ""}
                    name="phone"
                    type="tel"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Address line 1
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.address, "line1")}
                    name="line1"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Address line 2
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.address, "line2")}
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
                    defaultValue={readJsonField(profile?.address, "city")}
                    name="city"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  State
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.address, "state")}
                    name="state"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Postal code
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.address, "postalCode")}
                    name="postalCode"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Country
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.address, "country")}
                    name="country"
                    type="text"
                  />
                </label>
              </div>

              <SubmitButton>Save and continue</SubmitButton>
            </form>
          ) : null}

          {step === 2 ? (
            <form action={savePatientOnboardingStepAction} className="grid gap-5">
              <input name="step" type="hidden" value="2" />
              <label className="grid gap-2 text-sm font-medium">
                Emergency contact name
                <input
                  className={inputClassName}
                  defaultValue={readJsonField(profile?.emergencyContact, "name")}
                  name="emergencyName"
                  type="text"
                />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Relationship
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(
                      profile?.emergencyContact,
                      "relationship"
                    )}
                    name="emergencyRelationship"
                    type="text"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Phone
                  <input
                    className={inputClassName}
                    defaultValue={readJsonField(profile?.emergencyContact, "phone")}
                    name="emergencyPhone"
                    type="tel"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-52">
                  <SubmitButton>Save and continue</SubmitButton>
                </div>
                <Button name="skip" type="submit" value="1" variant="outline">
                  Skip this step
                </Button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <form action={savePatientOnboardingStepAction} className="grid gap-5">
              <input name="step" type="hidden" value="3" />
              <label className="grid gap-2 text-sm font-medium">
                Known allergies
                <textarea
                  className={textAreaClassName}
                  defaultValue={stringifyAllergies(profile?.allergies ?? [])}
                  name="allergies"
                  placeholder="One per line: allergen | severity | reaction | notes"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Current medications
                <textarea
                  className={textAreaClassName}
                  defaultValue={stringifyMedications(profile?.medications ?? [])}
                  name="medications"
                  placeholder="One per line: medication | dosage | frequency | prescribed by"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-52">
                  <SubmitButton>Finish onboarding</SubmitButton>
                </div>
                <Button name="skip" type="submit" value="1" variant="outline">
                  Skip and finish later
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  )
}
