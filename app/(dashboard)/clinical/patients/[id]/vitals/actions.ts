"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { calcBMI } from "@/lib/ehr/vitals"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseFloat_(value: string): number | null {
  if (!value) return null
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val))
  const query = url.searchParams.toString()
  return `${url.pathname}${query ? `?${query}` : ""}`
}

export async function recordVitalsAction(userId: string, formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "vitals:create")

  const redirectBase = `/clinical/patients/${userId}/vitals`

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  const systolicBP = parseFloat_(getString(formData, "systolicBP"))
  const diastolicBP = parseFloat_(getString(formData, "diastolicBP"))
  const heartRate = parseFloat_(getString(formData, "heartRate"))
  const temperature = parseFloat_(getString(formData, "temperature"))
  const respiratoryRate = parseFloat_(getString(formData, "respiratoryRate"))
  const oxygenSaturation = parseFloat_(getString(formData, "oxygenSaturation"))
  const weight = parseFloat_(getString(formData, "weight"))
  const height = parseFloat_(getString(formData, "height"))
  const notes = getString(formData, "notes") || null

  const bmi =
    weight != null && height != null && height > 0
      ? calcBMI(weight, height)
      : null

  const vital = await db.vitalSign.create({
    data: {
      patientId: patientProfile.id,
      recordedById: actor.id,
      systolicBP,
      diastolicBP,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      bmi,
      notes,
    },
  })

  await logAudit({
    action: "VITALS_RECORDED",
    entity: "VitalSign",
    entityId: vital.id,
    userId: actor.id,
    details: { patientUserId: userId, patientProfileId: patientProfile.id },
  })

  redirect(buildUrl(redirectBase, { message: "Vitals recorded." }))
}
