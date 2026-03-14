"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { RecordType } from "@/prisma/generated/client"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val))
  const query = url.searchParams.toString()
  return `${url.pathname}${query ? `?${query}` : ""}`
}

function parseRecordData(raw: string): object | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return { text: raw }
  }
}

const validRecordTypes = new Set<string>(Object.values(RecordType))

export async function addMedicalRecordAction(
  userId: string,
  formData: FormData
) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "vitals:create")

  const redirectBase = `/clinical/patients/${userId}/records`

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  const typeRaw = getString(formData, "type")
  const dateRaw = getString(formData, "date")
  const notes = getString(formData, "notes") || null
  const dataRaw = getString(formData, "data")

  if (!typeRaw || !dateRaw) {
    redirect(
      buildUrl(redirectBase + "/new", {
        error: "Type and date are required.",
      })
    )
  }

  if (!validRecordTypes.has(typeRaw)) {
    redirect(buildUrl(redirectBase + "/new", { error: "Invalid record type." }))
  }

  const date = new Date(dateRaw)
  if (isNaN(date.getTime())) {
    redirect(buildUrl(redirectBase + "/new", { error: "Invalid date." }))
  }

  const data = parseRecordData(dataRaw)

  const record = await db.medicalRecord.create({
    data: {
      patientId: patientProfile.id,
      providerId: actor.id,
      type: typeRaw as RecordType,
      date,
      notes,
      data: data ?? undefined,
    },
  })

  await logAudit({
    action: "MEDICAL_RECORD_ADDED",
    entity: "MedicalRecord",
    entityId: record.id,
    userId: actor.id,
    details: { patientUserId: userId, type: typeRaw },
  })

  redirect(buildUrl(redirectBase, { message: "Medical record added." }))
}
