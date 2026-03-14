"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

// Save the full weekly schedule for the current provider.
// Expects fields: day_0_active, day_0_start, day_0_end, day_0_duration, ... day_6_*
export async function saveWeeklyScheduleAction(formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "schedule:manage")

  // Delete existing schedules for this provider
  await db.providerSchedule.deleteMany({ where: { providerId: actor.id } })

  const rows = []
  for (let day = 0; day <= 6; day++) {
    const active = formData.get(`day_${day}_active`) === "on"
    if (!active) continue

    const startTime = getString(formData, `day_${day}_start`)
    const endTime = getString(formData, `day_${day}_end`)
    const slotDuration = parseInt(
      getString(formData, `day_${day}_duration`) || "30",
      10
    )

    if (!startTime || !endTime) continue

    // Validate end > start
    const [sh, sm] = startTime.split(":").map(Number)
    const [eh, em] = endTime.split(":").map(Number)
    if (eh * 60 + em <= sh * 60 + sm) continue // skip invalid rows silently

    // Validate slotDuration
    const validDuration =
      isNaN(slotDuration) || slotDuration < 5 || slotDuration > 120 ? 30 : slotDuration

    rows.push({
      providerId: actor.id,
      dayOfWeek: day,
      startTime,
      endTime,
      slotDuration: validDuration,
      isActive: true,
    })
  }

  if (rows.length > 0) {
    await db.providerSchedule.createMany({ data: rows })
  }

  await logAudit({
    userId: actor.id,
    action: "SCHEDULE_UPDATED",
    entity: "ProviderSchedule",
    entityId: actor.id,
    details: { daysConfigured: rows.length },
  })

  revalidatePath("/scheduling/manage")
  redirect("/scheduling/manage?message=Schedule+saved.")
}

export async function addTimeOffAction(formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "schedule:manage")

  const startDate = getString(formData, "startDate")
  const endDate = getString(formData, "endDate")
  const reason = getString(formData, "reason") || null

  if (!startDate || !endDate) {
    redirect("/scheduling/manage?error=Start+and+end+dates+are+required.")
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    redirect("/scheduling/manage?error=Invalid+date+format.")
  }

  if (end < start) {
    redirect("/scheduling/manage?error=End+date+must+be+on+or+after+start+date.")
  }

  const timeOff = await db.providerTimeOff.create({
    data: {
      providerId: actor.id,
      startDate: start,
      endDate: end,
      reason,
    },
  })

  await logAudit({
    userId: actor.id,
    action: "TIME_OFF_ADDED",
    entity: "ProviderTimeOff",
    entityId: timeOff.id,
  })

  revalidatePath("/scheduling/manage")
  redirect("/scheduling/manage?message=Time+off+added.")
}

export async function deleteTimeOffAction(timeOffId: string) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "schedule:manage")

  const record = await db.providerTimeOff.findUnique({
    where: { id: timeOffId },
    select: { providerId: true },
  })

  if (!record || record.providerId !== actor.id) {
    redirect("/scheduling/manage?error=Time+off+record+not+found.")
  }

  await db.providerTimeOff.delete({ where: { id: timeOffId } })

  await logAudit({
    userId: actor.id,
    action: "TIME_OFF_DELETED",
    entity: "ProviderTimeOff",
    entityId: timeOffId,
  })

  revalidatePath("/scheduling/manage")
  redirect("/scheduling/manage?message=Time+off+removed.")
}
