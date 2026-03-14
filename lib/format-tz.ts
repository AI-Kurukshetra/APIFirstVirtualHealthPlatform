import { formatInTimeZone } from "date-fns-tz"

/**
 * Format a UTC date for display in the viewer's timezone.
 * Returns e.g. "Mar 14, 2026 9:00 AM EST"
 */
export function formatAppointmentDate(
  date: Date,
  timezone: string,
  opts: { includeTime?: boolean; includeZone?: boolean } = {}
): string {
  const { includeTime = true, includeZone = true } = opts

  const datePart = "MMM d, yyyy"
  const timePart = includeTime ? " h:mm a" : ""
  const zonePart = includeTime && includeZone ? " zzz" : ""

  return formatInTimeZone(date, timezone, `${datePart}${timePart}${zonePart}`)
}

/**
 * Format just the time portion in the viewer's timezone.
 * Returns e.g. "9:00 AM"
 */
export function formatAppointmentTime(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "h:mm a")
}

/**
 * Format a date range (start → end) in the viewer's timezone.
 * Returns e.g. "Mar 14, 2026 · 9:00 – 9:30 AM EST"
 */
export function formatAppointmentRange(
  start: Date,
  end: Date,
  timezone: string
): string {
  const date = formatInTimeZone(start, timezone, "MMM d, yyyy")
  const startTime = formatInTimeZone(start, timezone, "h:mm")
  const endTime = formatInTimeZone(end, timezone, "h:mm a zzz")
  return `${date} · ${startTime} – ${endTime}`
}
