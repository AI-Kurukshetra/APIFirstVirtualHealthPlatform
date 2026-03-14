"use server"

import { redirect } from "next/navigation"
import {
  AppointmentStatus,
  AppointmentType,
  Role,
} from "@/prisma/generated/client"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const q = url.searchParams.toString()
  return `${url.pathname}${q ? `?${q}` : ""}`
}

const VALID_TYPES = new Set<string>(Object.values(AppointmentType))
const VALID_STATUSES = new Set<string>(Object.values(AppointmentStatus))

export async function bookAppointmentAction(formData: FormData) {
  const actor = await requireCurrentAppUser()

  // Patients book own; staff/providers/admins book for patients
  if (actor.role === Role.PATIENT) {
    requirePermission(actor.role, "appointments:create_own")
  } else {
    requirePermission(actor.role, "appointments:create")
  }

  const redirectBase = "/scheduling/calendar"

  const patientUserId = getString(formData, "patientUserId")
  const providerUserId = getString(formData, "providerUserId")
  const rawType = getString(formData, "type")
  const scheduledStart = getString(formData, "scheduledStart")
  const durationMin = parseInt(getString(formData, "durationMin") || "30", 10)
  const reason = getString(formData, "reason") || null
  const notes = getString(formData, "notes") || null

  // ── Basic field validation ──────────────────────────────────────────────
  if (!patientUserId || !providerUserId || !scheduledStart) {
    redirect(buildUrl(redirectBase, { error: "Missing required fields." }))
  }

  if (!VALID_TYPES.has(rawType)) {
    redirect(buildUrl(redirectBase, { error: "Invalid appointment type." }))
  }

  if (isNaN(durationMin) || durationMin < 5 || durationMin > 480) {
    redirect(buildUrl(redirectBase, { error: "Duration must be between 5 and 480 minutes." }))
  }

  const start = new Date(scheduledStart)
  if (isNaN(start.getTime())) {
    redirect(buildUrl(redirectBase, { error: "Invalid start time." }))
  }

  // ── No scheduling in the past ───────────────────────────────────────────
  if (start < new Date()) {
    redirect(buildUrl(redirectBase, { error: "Cannot schedule an appointment in the past." }))
  }

  const end = new Date(start.getTime() + durationMin * 60 * 1000)

  // ── Ownership check for patients: can only book for themselves ──────────
  if (actor.role === Role.PATIENT) {
    const ownProfile = await db.patientProfile.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    })
    if (!ownProfile || ownProfile.id !== patientUserId) {
      // patient tried to book for someone else — silently re-scope to own id
      redirect(buildUrl(redirectBase, { error: "You may only book appointments for yourself." }))
    }
  }

  // ── Resolve patient profile ─────────────────────────────────────────────
  const patientProfile = await db.patientProfile.findFirst({
    where: {
      // patientUserId is the User.id for non-patient roles, or PatientProfile.id for patients
      ...(actor.role === Role.PATIENT
        ? { userId: actor.id }
        : { user: { id: patientUserId, isActive: true } }),
    },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  // ── Resolve provider ────────────────────────────────────────────────────
  const provider = await db.user.findFirst({
    where: {
      id: providerUserId,
      role: { in: [Role.PROVIDER, Role.NURSE] },
      isActive: true,
    },
    select: { id: true },
  })

  if (!provider) {
    redirect(buildUrl(redirectBase, { error: "Provider not found or inactive." }))
  }

  // ── Provider time-off check ─────────────────────────────────────────────
  const conflictingTimeOff = await db.providerTimeOff.findFirst({
    where: {
      providerId: provider.id,
      startDate: { lte: end },
      endDate: { gte: start },
    },
  })

  if (conflictingTimeOff) {
    redirect(
      buildUrl(redirectBase, {
        error: "Provider is unavailable on the selected date (time off).",
      })
    )
  }

  // ── Provider conflict: overlapping active appointments ──────────────────
  const providerConflict = await db.appointment.findFirst({
    where: {
      providerId: provider.id,
      status: {
        notIn: [
          AppointmentStatus.CANCELLED,
          AppointmentStatus.NO_SHOW,
          AppointmentStatus.RESCHEDULED,
        ],
      },
      // Overlaps: existing.start < new.end AND existing.end > new.start
      scheduledStart: { lt: end },
      scheduledEnd: { gt: start },
    },
  })

  if (providerConflict) {
    redirect(
      buildUrl(redirectBase, {
        error: "Provider already has an appointment during this time slot.",
      })
    )
  }

  // ── Patient conflict: overlapping active appointments ───────────────────
  const patientConflict = await db.appointment.findFirst({
    where: {
      patientId: patientProfile.id,
      status: {
        notIn: [
          AppointmentStatus.CANCELLED,
          AppointmentStatus.NO_SHOW,
          AppointmentStatus.RESCHEDULED,
        ],
      },
      scheduledStart: { lt: end },
      scheduledEnd: { gt: start },
    },
  })

  if (patientConflict) {
    redirect(
      buildUrl(redirectBase, {
        error: "Patient already has an appointment during this time slot.",
      })
    )
  }

  // ── Create ──────────────────────────────────────────────────────────────
  const appointment = await db.appointment.create({
    data: {
      patientId: patientProfile.id,
      providerId: provider.id,
      scheduledStart: start,
      scheduledEnd: end,
      type: rawType as AppointmentType,
      reason,
      notes,
      status: AppointmentStatus.SCHEDULED,
    },
  })

  await logAudit({
    userId: actor.id,
    action: "APPOINTMENT_CREATED",
    entity: "Appointment",
    entityId: appointment.id,
    details: { patientUserId, providerUserId, type: rawType, durationMin },
  })

  if (actor.role === Role.PATIENT) {
    redirect(`/patient/appointments?message=Appointment+booked.`)
  }

  redirect(`/scheduling/${appointment.id}?message=Appointment+booked.`)
}

const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<AppointmentStatus, AppointmentStatus[]>
> = {
  [AppointmentStatus.SCHEDULED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
    AppointmentStatus.RESCHEDULED,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.RESCHEDULED]: [
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
}

// Roles that can manage ANY appointment (not just their own)
const GLOBAL_MANAGE_ROLES = new Set<Role>([
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.STAFF,
])

export async function updateAppointmentStatusAction(
  appointmentId: string,
  formData: FormData
) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "appointments:manage")

  const rawStatus = getString(formData, "status")
  const cancelReason = getString(formData, "cancelReason") || null

  // ── Validate incoming status value ──────────────────────────────────────
  if (!VALID_STATUSES.has(rawStatus)) {
    redirect(
      buildUrl(`/scheduling/${appointmentId}`, { error: "Invalid status value." })
    )
  }

  const newStatus = rawStatus as AppointmentStatus

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true, providerId: true },
  })

  if (!appointment) {
    redirect(buildUrl("/scheduling/calendar", { error: "Appointment not found." }))
  }

  // ── Ownership check: providers/nurses can only manage their OWN appointments ──
  if (
    !GLOBAL_MANAGE_ROLES.has(actor.role) &&
    appointment.providerId !== actor.id
  ) {
    redirect(
      buildUrl("/scheduling/calendar", {
        error: "You are not authorised to modify this appointment.",
      })
    )
  }

  // ── Validate transition ─────────────────────────────────────────────────
  const allowed = ALLOWED_STATUS_TRANSITIONS[appointment.status] ?? []
  if (!allowed.includes(newStatus)) {
    redirect(
      buildUrl(`/scheduling/${appointmentId}`, {
        error: `Cannot transition from ${appointment.status} to ${newStatus}.`,
      })
    )
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: newStatus,
      ...(cancelReason ? { cancelReason } : {}),
    },
  })

  await logAudit({
    userId: actor.id,
    action: "APPOINTMENT_STATUS_UPDATED",
    entity: "Appointment",
    entityId: appointmentId,
    details: { from: appointment.status, to: newStatus, cancelReason },
  })

  redirect(
    buildUrl(`/scheduling/${appointmentId}`, {
      message: `Status updated to ${newStatus.replace(/_/g, " ").toLowerCase()}.`,
    })
  )
}
