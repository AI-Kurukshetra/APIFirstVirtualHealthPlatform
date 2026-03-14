import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SlotPicker } from "@/components/scheduling/slot-picker"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { AppointmentType, Role } from "@/prisma/generated/client"
import { bookAppointmentAction } from "../actions"

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
  searchParams: Promise<{ error?: string; patientId?: string }>
}

export default async function NewAppointmentPage({ searchParams }: PageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/scheduling/calendar")
  requirePermission(user.role, "appointments:create")

  const { error, patientId: defaultPatientId } = await searchParams

  const [patients, providers] = await Promise.all([
    db.user.findMany({
      where: { role: Role.PATIENT, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        timezone: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    db.user.findMany({
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
    }),
  ])

  const providerOptions = providers.map((pv) => {
    const title = pv.providerProfile?.title ? `${pv.providerProfile.title} ` : ""
    const specialty =
      pv.providerProfile?.specialty?.length
        ? ` — ${pv.providerProfile.specialty[0]}`
        : ""
    return {
      id: pv.id,
      label: `${title}${pv.firstName} ${pv.lastName}${specialty}`,
    }
  })

  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
    timezone: p.timezone,
  }))

  const defaultProviderId =
    user.role === Role.PROVIDER || user.role === Role.NURSE ? user.id : ""

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary w-full"

  return (
    <section className="grid gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/scheduling/calendar">← Back to appointments</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Book appointment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a patient, provider, and an available time slot.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={bookAppointmentAction} className="mt-6 grid gap-5">
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

          {/* Slot picker — manages patient, provider, duration, date, slot grid */}
          {/* Hidden inputs patientUserId, scheduledStart, durationMin emitted by SlotPicker */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <SlotPicker
              providers={providerOptions}
              patients={patientOptions}
              defaultProviderId={defaultProviderId}
              defaultPatientId={defaultPatientId ?? ""}
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

          {/* Internal notes */}
          <div className="grid gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium">
              Internal notes{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className={inputCls}
              placeholder="Preparation instructions, room assignment, etc."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Book appointment</Button>
            <Button asChild variant="outline">
              <Link href="/scheduling/calendar">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
