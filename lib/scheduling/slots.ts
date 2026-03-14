import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"

import { AppointmentStatus } from "@/prisma/generated/client"
import { db } from "@/lib/db"

export interface TimeSlot {
  /** UTC ISO string — fed directly into the booking form hidden input */
  start: string
  end: string
  /** Human-readable label in the viewer's (patient's) timezone, e.g. "9:00 – 9:30 AM IST" */
  label: string
  /** Duration in minutes */
  durationMin: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** "09:30" → 570 (minutes from midnight) */
function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

/**
 * Returns true if two intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 * Both expressed as minutes-from-midnight.
 */
function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && aEnd > bStart
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Compute available time slots for a given provider, date, and appointment duration.
 *
 * All time math is done in the provider's timezone. Slot start/end are returned
 * as UTC ISO strings so the booking action can store them directly.
 * Labels are formatted in the viewer's (patient's) timezone.
 *
 * Rules applied (in order):
 *  1. No schedule for that day-of-week → []
 *  2. Provider is on time off that date → []
 *  3. Slots that fall outside working hours → excluded
 *  4. Slots that overlap an existing active appointment → excluded
 *  5. Slots that overlap a provider break → excluded
 *  6. Slots whose UTC start is already in the past → excluded
 *
 * @param providerId       User.id of the provider (not ProviderProfile.id)
 * @param dateStr          "YYYY-MM-DD" representing a date in the provider's timezone
 * @param durationMin      Requested appointment length in minutes
 * @param providerTimezone IANA timezone string for schedule interpretation, e.g. "America/New_York"
 * @param viewerTimezone   IANA timezone string for label formatting (patient's timezone)
 */
export async function getAvailableSlots(
  providerId: string,
  dateStr: string,
  durationMin: number,
  providerTimezone: string = "UTC",
  viewerTimezone: string = "UTC"
): Promise<TimeSlot[]> {
  if (!providerId || !dateStr || durationMin < 5 || durationMin > 480) {
    return []
  }

  // Parse the date in the provider's timezone
  const dateInTz = fromZonedTime(`${dateStr}T00:00:00`, providerTimezone)
  if (isNaN(dateInTz.getTime())) return []

  // day-of-week in the provider's local timezone
  const dayOfWeek = toZonedTime(dateInTz, providerTimezone).getDay()

  // 1. Load provider's schedule for this day
  const schedule = await db.providerSchedule.findFirst({
    where: { providerId, dayOfWeek, isActive: true },
  })

  if (!schedule) return []

  const workStart = toMinutes(schedule.startTime)
  const workEnd = toMinutes(schedule.endTime)

  if (workEnd <= workStart) return []

  // 2. Check time off — query in UTC using the full provider-local day boundaries
  const dayStart = fromZonedTime(`${dateStr}T00:00:00`, providerTimezone)
  const dayEnd = fromZonedTime(`${dateStr}T23:59:59`, providerTimezone)

  const timeOff = await db.providerTimeOff.findFirst({
    where: {
      providerId,
      startDate: { lte: dayEnd },
      endDate: { gte: dayStart },
    },
  })

  if (timeOff) return []

  // 3. Load breaks for this day
  const breaks = await db.providerBreak.findMany({
    where: { providerId, dayOfWeek },
  })

  const breakRanges = breaks.map((b) => ({
    start: toMinutes(b.startTime),
    end: toMinutes(b.endTime),
  }))

  // 4. Load existing active appointments on this day (stored as UTC in DB)
  const existingAppointments = await db.appointment.findMany({
    where: {
      providerId,
      status: {
        notIn: [
          AppointmentStatus.CANCELLED,
          AppointmentStatus.NO_SHOW,
          AppointmentStatus.RESCHEDULED,
        ],
      },
      scheduledStart: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledStart: true, scheduledEnd: true },
  })

  // Convert booked UTC times to provider's local time for minute-based comparison
  const bookedRanges = existingAppointments.map((a) => {
    const startLocal = toZonedTime(a.scheduledStart, providerTimezone)
    const endLocal = toZonedTime(a.scheduledEnd, providerTimezone)
    return {
      start: startLocal.getHours() * 60 + startLocal.getMinutes(),
      end: endLocal.getHours() * 60 + endLocal.getMinutes(),
    }
  })

  // 5. Past-slot guard — compare UTC timestamps directly (timezone-agnostic)
  const nowUtc = new Date()

  // 6. Generate candidate slots
  const step = schedule.slotDuration
  const slots: TimeSlot[] = []

  for (
    let slotStart = workStart;
    slotStart + durationMin <= workEnd;
    slotStart += step
  ) {
    const slotEnd = slotStart + durationMin

    const sh = Math.floor(slotStart / 60)
    const sm = slotStart % 60
    const eh = Math.floor(slotEnd / 60)
    const em = slotEnd % 60

    const slotStartLocal = `${dateStr}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00`
    const slotEndLocal = `${dateStr}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`

    // Convert provider-local wall-clock times to UTC for storage
    const startUtc = fromZonedTime(slotStartLocal, providerTimezone)
    const endUtc = fromZonedTime(slotEndLocal, providerTimezone)

    // Skip slots already in the past (UTC comparison — works for all timezones)
    if (startUtc <= nowUtc) continue

    const hasBreak = breakRanges.some((b) =>
      overlaps(slotStart, slotEnd, b.start, b.end)
    )
    if (hasBreak) continue

    const hasConflict = bookedRanges.some((a) =>
      overlaps(slotStart, slotEnd, a.start, a.end)
    )
    if (hasConflict) continue

    // Label shows time in the viewer's (patient's) timezone
    const startLabel = formatInTimeZone(startUtc, viewerTimezone, "h:mm")
    const endLabel = formatInTimeZone(endUtc, viewerTimezone, "h:mm a")

    slots.push({
      start: startUtc.toISOString(),
      end: endUtc.toISOString(),
      label: `${startLabel} – ${endLabel}`,
      durationMin,
    })
  }

  return slots
}
