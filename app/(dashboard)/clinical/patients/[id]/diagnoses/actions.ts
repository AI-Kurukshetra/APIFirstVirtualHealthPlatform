"use server"

import { redirect } from "next/navigation"

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
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val))
  const query = url.searchParams.toString()
  return `${url.pathname}${query ? `?${query}` : ""}`
}

export async function addDiagnosisAction(userId: string, formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "diagnoses:manage")

  const redirectBase = `/clinical/patients/${userId}/diagnoses`

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  const icdCode = getString(formData, "icdCode")
  const description = getString(formData, "description")
  const status = getString(formData, "status") || "ACTIVE"
  const diagnosedDateRaw = getString(formData, "diagnosedDate")
  const notes = getString(formData, "notes") || null

  if (!icdCode || !description || !diagnosedDateRaw) {
    redirect(
      buildUrl(redirectBase + "/new", {
        error: "ICD code, description, and diagnosed date are required.",
      })
    )
  }

  const diagnosedDate = new Date(diagnosedDateRaw)

  if (isNaN(diagnosedDate.getTime())) {
    redirect(
      buildUrl(redirectBase + "/new", { error: "Invalid diagnosed date." })
    )
  }

  const diagnosis = await db.diagnosis.create({
    data: {
      patientId: patientProfile.id,
      providerId: actor.id,
      icdCode,
      description,
      status,
      diagnosedDate,
      notes,
    },
  })

  await logAudit({
    action: "DIAGNOSIS_ADDED",
    entity: "Diagnosis",
    entityId: diagnosis.id,
    userId: actor.id,
    details: { patientUserId: userId, icdCode, status },
  })

  redirect(buildUrl(redirectBase, { message: "Diagnosis added." }))
}

export async function updateDiagnosisStatusAction(
  diagnosisId: string,
  status: string,
  redirectTo: string
) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "diagnoses:manage")

  const validStatuses = new Set(["ACTIVE", "RESOLVED", "CHRONIC"])
  if (!validStatuses.has(status)) {
    redirect(buildUrl(redirectTo, { error: "Invalid diagnosis status." }))
  }

  const diagnosis = await db.diagnosis.findUnique({
    where: { id: diagnosisId },
    select: { id: true },
  })

  if (!diagnosis) {
    redirect(buildUrl(redirectTo, { error: "Diagnosis not found." }))
  }

  const updatedDiagnosis = await db.diagnosis.update({
    where: { id: diagnosisId },
    data: {
      status,
      ...(status === "RESOLVED" ? { resolvedDate: new Date() } : {}),
    },
  })

  await logAudit({
    action: "DIAGNOSIS_UPDATED",
    entity: "Diagnosis",
    entityId: updatedDiagnosis.id,
    userId: actor.id,
    details: { status },
  })

  redirect(buildUrl(redirectTo, { message: "Diagnosis status updated." }))
}
