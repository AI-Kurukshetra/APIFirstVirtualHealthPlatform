import Link from "next/link"

import { formatInTimeZone } from "date-fns-tz"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { AppointmentStatus, AppointmentType } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  INITIAL_CONSULTATION: "Initial Consultation",
  FOLLOW_UP: "Follow-up",
  ROUTINE_CHECKUP: "Routine Checkup",
  URGENT: "Urgent",
  VIDEO_CONSULTATION: "Video Consultation",
  PHONE_CONSULTATION: "Phone Consultation",
}

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-800" },
  CHECKED_IN: {
    label: "Checked In",
    className: "bg-purple-100 text-purple-800",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-800",
  },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  NO_SHOW: { label: "No Show", className: "bg-orange-100 text-orange-800" },
  RESCHEDULED: {
    label: "Rescheduled",
    className: "bg-gray-100 text-gray-700",
  },
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

interface PageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function PatientAppointmentsPage({
  searchParams,
}: PageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/appointments")

  const { message } = await searchParams

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  const appointments = patientProfile
    ? await db.appointment.findMany({
        where: { patientId: patientProfile.id },
        orderBy: { scheduledStart: "desc" },
        include: {
          provider: {
            select: {
              firstName: true,
              lastName: true,
              providerProfile: { select: { title: true, specialty: true } },
            },
          },
        },
      })
    : []

  const now = new Date()
  const upcoming = appointments.filter(
    (a) =>
      a.scheduledStart >= now &&
      a.status !== AppointmentStatus.CANCELLED &&
      a.status !== AppointmentStatus.COMPLETED &&
      a.status !== AppointmentStatus.NO_SHOW
  )
  const past = appointments.filter(
    (a) =>
      a.scheduledStart < now ||
      a.status === AppointmentStatus.COMPLETED ||
      a.status === AppointmentStatus.CANCELLED ||
      a.status === AppointmentStatus.NO_SHOW
  )

  const viewerTz = user.timezone
  function fmt(date: Date) {
    return formatInTimeZone(date, viewerTz, "EEE, MMM d, yyyy h:mm a zzz")
  }

  function AppointmentRow({
    appt,
  }: {
    appt: (typeof appointments)[number]
  }) {
    const title = appt.provider.providerProfile?.title
      ? `${appt.provider.providerProfile.title} `
      : ""
    const specialty = appt.provider.providerProfile?.specialty?.[0]
      ? ` — ${appt.provider.providerProfile.specialty[0]}`
      : ""

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {fmt(appt.scheduledStart)}
            </span>
            <StatusBadge status={appt.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {APPOINTMENT_TYPE_LABELS[appt.type]} · {title}
            {appt.provider.firstName} {appt.provider.lastName}
            {specialty}
          </p>
          {appt.reason && (
            <p className="text-xs text-muted-foreground italic">{appt.reason}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Patient Portal
          </p>
          <h1 className="mt-1 text-2xl font-semibold">My Appointments</h1>
        </div>
        <Button asChild size="sm">
          <Link href="/patient/appointments/new">+ Book appointment</Link>
        </Button>
      </div>

      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You have no appointments yet. Contact your care team to schedule one.
        </div>
      ) : (
        <div className="grid gap-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Upcoming
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
                {upcoming.map((appt) => (
                  <AppointmentRow key={appt.id} appt={appt} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Past
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
                {past.map((appt) => (
                  <AppointmentRow key={appt.id} appt={appt} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
