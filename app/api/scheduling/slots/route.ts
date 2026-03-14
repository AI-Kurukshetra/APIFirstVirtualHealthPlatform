import { NextRequest, NextResponse } from "next/server"

import { getCurrentAppUser } from "@/lib/auth/session"
import { hasAnyPermission } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getAvailableSlots } from "@/lib/scheduling/slots"

export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const user = await getCurrentAppUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Must have at least one of these permissions to query slots
  const canQuery = hasAnyPermission(user.role, [
    "appointments:create",
    "appointments:create_own",
  ])

  if (!canQuery) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ── Parse query params ───────────────────────────────────────────────────
  const { searchParams } = request.nextUrl
  const providerId = searchParams.get("providerId") ?? ""
  const dateStr = searchParams.get("date") ?? ""
  const rawDuration = searchParams.get("duration") ?? "30"
  const durationMin = parseInt(rawDuration, 10)
  // viewerTimezone: patient's IANA timezone — labels are shown in this timezone
  const viewerTimezone = searchParams.get("viewerTimezone") ?? "UTC"

  if (!providerId || !dateStr) {
    return NextResponse.json(
      { error: "providerId and date are required" },
      { status: 400 }
    )
  }

  // Validate date format: must be YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 }
    )
  }

  if (isNaN(durationMin) || durationMin < 5 || durationMin > 480) {
    return NextResponse.json(
      { error: "duration must be between 5 and 480 minutes" },
      { status: 400 }
    )
  }

  // ── Compute slots ────────────────────────────────────────────────────────
  const provider = await db.user.findUnique({
    where: { id: providerId },
    select: { timezone: true },
  })

  const providerTimezone = provider?.timezone ?? "UTC"

  const slots = await getAvailableSlots(
    providerId,
    dateStr,
    durationMin,
    providerTimezone,
    viewerTimezone
  )

  return NextResponse.json({ slots, viewerTimezone, providerTimezone })
}
