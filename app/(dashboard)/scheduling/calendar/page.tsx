import Link from "next/link"

import { formatInTimeZone } from "date-fns-tz"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import {
  AppointmentStatus,
  AppointmentType,
  Role,
} from "@/prisma/generated/client"

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

function formatTime(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "h:mm a")
}

function formatDateHeading(date: Date, timezone: string) {
  const todayStr = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd")
  const dateStr = formatInTimeZone(date, timezone, "yyyy-MM-dd")
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = formatInTimeZone(tomorrowDate, timezone, "yyyy-MM-dd")

  const label = formatInTimeZone(date, timezone, "EEEE, MMMM d, yyyy")

  if (dateStr === todayStr) return `Today — ${label}`
  if (dateStr === tomorrowStr) return `Tomorrow — ${label}`
  return label
}

export default async function SchedulingCalendarPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/scheduling/calendar")

  const canManage = hasPermission(user.role, "appointments:manage")
  const canCreate = hasPermission(user.role, "appointments:create")
  const canManageSchedule = hasPermission(user.role, "schedule:manage")

  const rangeStart = new Date()
  rangeStart.setDate(rangeStart.getDate() - 30)
  const rangeEnd = new Date()
  rangeEnd.setDate(rangeEnd.getDate() + 60)

  // Build row-level filter:
  // Patients must never reach this page (ensurePathAccess uses appointments:read which patients lack)
  // but guard defensively anyway
  let whereProvider: Record<string, unknown> = {}
  if (user.role === Role.PROVIDER || user.role === Role.NURSE) {
    whereProvider = { providerId: user.id }
  } else if (user.role === Role.PATIENT) {
    // Patients have appointments:read_own — redirect them to their portal
    const ownProfile = await db.patientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    whereProvider = { patientId: ownProfile?.id ?? "__none__" }
  }

  const appointments = await db.appointment.findMany({
    where: {
      ...whereProvider,
      scheduledStart: { gte: rangeStart, lte: rangeEnd },
    },
    orderBy: { scheduledStart: "asc" },
    include: {
      patient: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      provider: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  const viewerTz = user.timezone

  // Group by date in the viewer's timezone
  const grouped = new Map<string, typeof appointments>()
  for (const appt of appointments) {
    const key = formatInTimeZone(appt.scheduledStart, viewerTz, "yyyy-MM-dd")
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(appt)
  }

  const now = new Date()
  const todayStr = formatInTimeZone(now, viewerTz, "yyyy-MM-dd")

  const upcoming = appointments.filter(
    (a) =>
      a.scheduledStart >= now &&
      a.status !== AppointmentStatus.CANCELLED &&
      a.status !== AppointmentStatus.COMPLETED &&
      a.status !== AppointmentStatus.NO_SHOW
  )

  const todayAppts = appointments.filter(
    (a) =>
      formatInTimeZone(a.scheduledStart, viewerTz, "yyyy-MM-dd") === todayStr
  )

  const completedLast30 = appointments.filter(
    (a) => a.status === AppointmentStatus.COMPLETED && a.scheduledStart >= rangeStart
  )

  const cancelledLast30 = appointments.filter(
    (a) => a.status === AppointmentStatus.CANCELLED
  )

  const isAdminOrStaff =
    user.role === Role.ADMIN ||
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.STAFF

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Scheduling
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Appointments</h1>
        </div>
        <div className="flex gap-2">
          {canManageSchedule && (
            <Button asChild variant="outline" size="sm">
              <Link href="/scheduling/manage">Manage availability</Link>
            </Button>
          )}
          {canCreate && (
            <Button asChild size="sm">
              <Link href="/scheduling/new">+ New appointment</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Upcoming", count: upcoming.length, color: "text-blue-600" },
          { label: "Today", count: todayAppts.length, color: "text-indigo-600" },
          {
            label: "Completed (30d)",
            count: completedLast30.length,
            color: "text-green-600",
          },
          {
            label: "Cancelled (30d)",
            count: cancelledLast30.length,
            color: "text-red-600",
          },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {grouped.size === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No appointments in this window.
          {canCreate && (
            <>
              {" "}
              <Link
                href="/scheduling/new"
                className="font-medium text-primary hover:underline"
              >
                Book one now
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {Array.from(grouped.entries()).map(([dateKey, dayAppts]) => (
            <div key={dateKey}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {formatDateHeading(new Date(dateKey + "T12:00:00Z"), viewerTz)}
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
                {dayAppts.map((appt) => (
                  <Link
                    key={appt.id}
                    href={`/scheduling/${appt.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatTime(appt.scheduledStart, viewerTz)} –{" "}
                          {formatTime(appt.scheduledEnd, viewerTz)}
                        </span>
                        <StatusBadge status={appt.status} />
                        <span className="text-xs text-muted-foreground">
                          {APPOINTMENT_TYPE_LABELS[appt.type]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Patient:{" "}
                        <span className="font-medium text-foreground">
                          {appt.patient.user.firstName}{" "}
                          {appt.patient.user.lastName}
                        </span>
                        {isAdminOrStaff && (
                          <>
                            {" "}
                            · Provider:{" "}
                            <span className="font-medium text-foreground">
                              {appt.provider.firstName}{" "}
                              {appt.provider.lastName}
                            </span>
                          </>
                        )}
                        {appt.reason && (
                          <> · <span className="italic">{appt.reason}</span></>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      View →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
