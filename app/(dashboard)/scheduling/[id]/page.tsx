import Link from "next/link"
import { notFound } from "next/navigation"

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
import { updateAppointmentStatusAction } from "../actions"

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

// Which status buttons to show based on current status
const NEXT_ACTIONS: Partial<
  Record<
    AppointmentStatus,
    { status: AppointmentStatus; label: string; variant?: string }[]
  >
> = {
  [AppointmentStatus.SCHEDULED]: [
    { status: AppointmentStatus.CONFIRMED, label: "Confirm" },
    { status: AppointmentStatus.CANCELLED, label: "Cancel", variant: "destructive" },
    { status: AppointmentStatus.NO_SHOW, label: "No Show", variant: "outline" },
  ],
  [AppointmentStatus.CONFIRMED]: [
    { status: AppointmentStatus.CHECKED_IN, label: "Check In" },
    {
      status: AppointmentStatus.RESCHEDULED,
      label: "Reschedule",
      variant: "outline",
    },
    { status: AppointmentStatus.CANCELLED, label: "Cancel", variant: "destructive" },
    { status: AppointmentStatus.NO_SHOW, label: "No Show", variant: "outline" },
  ],
  [AppointmentStatus.CHECKED_IN]: [
    { status: AppointmentStatus.IN_PROGRESS, label: "Start Visit" },
    { status: AppointmentStatus.NO_SHOW, label: "No Show", variant: "outline" },
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    { status: AppointmentStatus.COMPLETED, label: "Complete" },
    { status: AppointmentStatus.NO_SHOW, label: "No Show", variant: "outline" },
  ],
  [AppointmentStatus.RESCHEDULED]: [
    { status: AppointmentStatus.CANCELLED, label: "Cancel", variant: "destructive" },
  ],
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/scheduling/calendar")

  const { id } = await params
  const { message, error } = await searchParams

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      provider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          providerProfile: { select: { title: true, specialty: true } },
        },
      },
      clinicalNotes: {
        select: { id: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!appointment) notFound()

  // Providers/nurses can only see their own appointments
  if (
    (user.role === Role.PROVIDER || user.role === Role.NURSE) &&
    appointment.providerId !== user.id
  ) {
    notFound()
  }

  // Patients can only see their own appointments
  if (user.role === Role.PATIENT) {
    const ownProfile = await db.patientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!ownProfile || appointment.patientId !== ownProfile.id) {
      notFound()
    }
  }

  const canManage = hasPermission(user.role, "appointments:manage")
  const nextActions = canManage ? (NEXT_ACTIONS[appointment.status] ?? []) : []

  const patientUser = appointment.patient.user
  const provider = appointment.provider

  const statusStyle = STATUS_STYLES[appointment.status]

  const viewerTz = user.timezone
  function fmt(date: Date) {
    return formatInTimeZone(date, viewerTz, "EEE, MMM d, yyyy h:mm a zzz")
  }

  const showCancelReason =
    appointment.status === AppointmentStatus.CANCELLED &&
    appointment.cancelReason

  return (
    <section className="grid gap-6">
      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/scheduling/calendar">← Back to appointments</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main details */}
        <div className="lg:col-span-2 grid gap-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Appointment
                </p>
                <h1 className="mt-1 text-xl font-semibold">
                  {APPOINTMENT_TYPE_LABELS[appointment.type]}
                </h1>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyle.className}`}
              >
                {statusStyle.label}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-muted-foreground">Start</dt>
                <dd className="font-medium">{fmt(appointment.scheduledStart)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-muted-foreground">End</dt>
                <dd className="font-medium">{fmt(appointment.scheduledEnd)}</dd>
              </div>
              {appointment.reason && (
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">Reason</dt>
                  <dd>{appointment.reason}</dd>
                </div>
              )}
              {appointment.notes && (
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">Notes</dt>
                  <dd className="whitespace-pre-wrap">{appointment.notes}</dd>
                </div>
              )}
              {showCancelReason && (
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">
                    Cancel reason
                  </dt>
                  <dd className="text-red-700">{appointment.cancelReason}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          {nextActions.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold">Update status</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {nextActions.map((action) => {
                  const boundAction = updateAppointmentStatusAction.bind(
                    null,
                    appointment.id
                  )
                  return (
                    <form key={action.status} action={boundAction}>
                      <input type="hidden" name="status" value={action.status} />
                      {action.status === AppointmentStatus.CANCELLED && (
                        <div className="mb-3">
                          <input
                            type="text"
                            name="cancelReason"
                            placeholder="Reason for cancellation (optional)"
                            className="w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      )}
                      <Button
                        type="submit"
                        variant={
                          action.variant === "destructive"
                            ? "destructive"
                            : action.variant === "outline"
                              ? "outline"
                              : "default"
                        }
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    </form>
                  )
                })}
              </div>
            </div>
          )}

          {/* Associated notes */}
          {appointment.clinicalNotes.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold">Clinical notes</h2>
              <div className="mt-3 divide-y divide-border rounded-2xl border border-border">
                {appointment.clinicalNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/clinical/patients/${patientUser.id}/notes/${note.id}`}
                    className="flex items-center justify-between p-3 text-sm transition-colors hover:bg-muted/30"
                  >
                    <span>{note.type.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — patient + provider */}
        <div className="grid gap-4 content-start">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Patient
            </h2>
            <p className="mt-2 font-medium">
              {patientUser.firstName} {patientUser.lastName}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {patientUser.email}
            </p>
            {patientUser.phone && (
              <p className="text-sm text-muted-foreground">{patientUser.phone}</p>
            )}
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href={`/clinical/patients/${patientUser.id}`}>
                View patient →
              </Link>
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Provider
            </h2>
            <p className="mt-2 font-medium">
              {provider.providerProfile?.title && (
                <span className="text-muted-foreground">
                  {provider.providerProfile.title}{" "}
                </span>
              )}
              {provider.firstName} {provider.lastName}
            </p>
            {provider.providerProfile?.specialty &&
              provider.providerProfile.specialty.length > 0 && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {provider.providerProfile.specialty.join(", ")}
                </p>
              )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {provider.email}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
