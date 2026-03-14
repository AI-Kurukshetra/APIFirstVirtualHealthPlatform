"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { NoteType } from "@/prisma/generated/client"

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

const validNoteTypes = new Set<string>(Object.values(NoteType))

export async function saveTemplateAction(formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "notes:create")

  const redirectBase = "/clinical/templates"

  const templateId = getString(formData, "templateId") || null
  const name = getString(formData, "name")
  const typeRaw = getString(formData, "type")
  const subjective = getString(formData, "subjective") || null
  const objective = getString(formData, "objective") || null
  const assessment = getString(formData, "assessment") || null
  const plan = getString(formData, "plan") || null
  const specialty = getString(formData, "specialty") || null

  if (!name || !typeRaw) {
    redirect(
      buildUrl(
        templateId
          ? `${redirectBase}/${templateId}/edit`
          : `${redirectBase}/new`,
        { error: "Name and type are required." }
      )
    )
  }

  if (!validNoteTypes.has(typeRaw)) {
    redirect(
      buildUrl(`${redirectBase}/new`, { error: "Invalid note type." })
    )
  }

  let template: { id: string }

  if (templateId) {
    template = await db.noteTemplate.update({
      where: { id: templateId },
      data: {
        name,
        type: typeRaw as NoteType,
        subjective,
        objective,
        assessment,
        plan,
        specialty,
      },
    })
  } else {
    template = await db.noteTemplate.create({
      data: {
        name,
        type: typeRaw as NoteType,
        subjective,
        objective,
        assessment,
        plan,
        specialty,
        isSystem: false,
        createdById: actor.id,
      },
    })
  }

  await logAudit({
    action: templateId ? "TEMPLATE_UPDATED" : "TEMPLATE_CREATED",
    entity: "NoteTemplate",
    entityId: template.id,
    userId: actor.id,
    details: { name, type: typeRaw },
  })

  redirect(buildUrl(redirectBase, { message: "Template saved." }))
}
