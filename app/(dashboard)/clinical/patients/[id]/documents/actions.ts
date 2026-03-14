"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { DocumentCategory } from "@/prisma/generated/client"

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

const validCategories = new Set<string>(Object.values(DocumentCategory))

export async function addDocumentAction(userId: string, formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "documents:upload")

  const redirectBase = `/clinical/patients/${userId}/documents`

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  const name = getString(formData, "name")
  const categoryRaw = getString(formData, "category")
  const fileUrl = getString(formData, "fileUrl")
  const fileType = getString(formData, "fileType")
  const fileSizeRaw = getString(formData, "fileSize")
  const notes = getString(formData, "notes") || null

  if (!name || !categoryRaw || !fileUrl || !fileType) {
    redirect(
      buildUrl(redirectBase + "/upload", {
        error: "Name, category, file URL, and file type are required.",
      })
    )
  }

  if (!validCategories.has(categoryRaw)) {
    redirect(
      buildUrl(redirectBase + "/upload", { error: "Invalid document category." })
    )
  }

  const fileSize = parseInt(fileSizeRaw, 10) || 0

  const document = await db.document.create({
    data: {
      patientId: patientProfile.id,
      uploadedById: actor.id,
      name,
      category: categoryRaw as DocumentCategory,
      fileUrl,
      fileType,
      fileSize,
      notes,
    },
  })

  await logAudit({
    action: "DOCUMENT_UPLOADED",
    entity: "Document",
    entityId: document.id,
    userId: actor.id,
    details: { patientUserId: userId, name, category: categoryRaw },
  })

  redirect(buildUrl(redirectBase, { message: "Document uploaded." }))
}
