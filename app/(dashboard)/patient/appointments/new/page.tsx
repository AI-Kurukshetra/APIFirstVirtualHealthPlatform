import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SlotPicker } from "@/components/scheduling/slot-picker"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { AppointmentType, Role } from "@/prisma/generated/client"
import { bookAppointmentAction } from "@/app/(dashboard)/scheduling/actions"

export const dynamic = "force-dynamic"

const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  INITIAL_CONSULTATION: "Initial Consultation",
  FOLLOW_UP: "Follow-up",
  ROUTINE_CHECKUP: "Routine Checkup",
  URGENT: "Urgent",
  VIDEO_CONSULTATION: "Video Consultation",
  PHONE_CONSULTATION: "Phone Consultation",
}

interface PageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function PatientNewAppointmentPage({
  searchParams,
}: PageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/appointments")
  requirePermission(user.role, "appointments:create_own")

  const { message, error } = await searchParams

  // Load patient's own profile id
  const patientProfile = await db.patientProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!patientProfile) {
    return (
      <section className="grid gap-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/patient/appointments">← Back to appointments</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Your patient profile is not set up yet. Please complete onboarding
          first.
        </div>
      </section>
    )
  }

  // Load active providers
  const providers = await db.user.findMany({
    where: {
      role: { in: [Role.PROVIDER, Role.NURSE] },
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      providerProfile: { select: { title: true, specialty: true } },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  })

  const providerOptions = providers.map((pv) => {
    const title = pv.providerProfile?.title ? `${pv.providerProfile.title} ` : ""
    const specialty = pv.providerProfile?.specialty?.length
      ? ` — ${pv.providerProfile.specialty[0]}`
      : ""
    return {
      id: pv.id,
      label: `${title}${pv.firstName} ${pv.lastName}${specialty}`,
    }
  })

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary w-full"

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Patient Portal
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Book an appointment</h1>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        {message && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={bookAppointmentAction} className="grid gap-5">
          {/* Appointment type */}
          <div className="grid gap-1.5">
            <label htmlFor="type" className="text-sm font-medium">
              Appointment type <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              className={inputCls}
            >
              {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Slot picker — self-booking mode: no patient selector */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <SlotPicker
              providers={providerOptions}
              selfPatientId={patientProfile.id}
              selfTimezone={user.timezone}
            />
          </div>

          {/* Reason */}
          <div className="grid gap-1.5">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <input
              id="reason"
              name="reason"
              type="text"
              placeholder="e.g. Annual checkup, knee pain follow-up…"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Book appointment</Button>
            <Button asChild variant="outline">
              <Link href="/patient/appointments">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
