"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { NoteStatus, NoteType } from "@/prisma/generated/client"

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

export async function saveNoteAction(userId: string, formData: FormData) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "notes:create")

  const redirectBase = `/clinical/patients/${userId}/notes`

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!patientProfile) {
    redirect(buildUrl(redirectBase, { error: "Patient profile not found." }))
  }

  const noteId = getString(formData, "noteId") || null
  const typeRaw = getString(formData, "type")
  const subjective = getString(formData, "subjective") || null
  const objective = getString(formData, "objective") || null
  const assessment = getString(formData, "assessment") || null
  const plan = getString(formData, "plan") || null

  if (!typeRaw || !validNoteTypes.has(typeRaw)) {
    redirect(
      buildUrl(noteId ? `${redirectBase}/${noteId}/edit` : `${redirectBase}/new`, {
        error: "A valid note type is required.",
      })
    )
  }

  let note: { id: string }

  if (noteId) {
    const existing = await db.clinicalNote.findUnique({
      where: { id: noteId },
      select: { id: true, status: true, patientId: true, providerId: true },
    })

    if (!existing) {
      redirect(buildUrl(redirectBase, { error: "Note not found." }))
    }

    if (existing.patientId !== patientProfile.id) {
      redirect(buildUrl(redirectBase, { error: "Note does not belong to this patient." }))
    }

    if (existing.providerId !== actor.id) {
      redirect(buildUrl(redirectBase, { error: "You can only edit your own notes." }))
    }

    if (existing.status !== NoteStatus.DRAFT) {
      redirect(
        buildUrl(redirectBase, { error: "Only draft notes can be edited." })
      )
    }

    note = await db.clinicalNote.update({
      where: { id: noteId },
      data: {
        type: typeRaw as NoteType,
        subjective,
        objective,
        assessment,
        plan,
      },
    })
  } else {
    note = await db.clinicalNote.create({
      data: {
        patientId: patientProfile.id,
        providerId: actor.id,
        type: typeRaw as NoteType,
        status: NoteStatus.DRAFT,
        subjective,
        objective,
        assessment,
        plan,
      },
    })
  }

  await logAudit({
    action: "NOTE_SAVED",
    entity: "ClinicalNote",
    entityId: note.id,
    userId: actor.id,
    details: { patientUserId: userId, noteId: note.id, isNew: !noteId },
  })

  redirect(
    buildUrl(`${redirectBase}/${note.id}`, { message: "Note saved as draft." })
  )
}

export async function signNoteAction(noteId: string, redirectTo: string) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "notes:sign")

  const note = await db.clinicalNote.findUnique({
    where: { id: noteId },
    select: { id: true, status: true, providerId: true },
  })

  if (!note) {
    redirect(buildUrl(redirectTo, { error: "Note not found." }))
  }

  if (note.providerId !== actor.id) {
    redirect(buildUrl(redirectTo, { error: "You can only sign your own notes." }))
  }

  if (note.status !== NoteStatus.DRAFT) {
    redirect(buildUrl(redirectTo, { error: "Only draft notes can be signed." }))
  }

  const updated = await db.clinicalNote.update({
    where: { id: noteId },
    data: {
      status: NoteStatus.SIGNED,
      signedAt: new Date(),
    },
  })

  await logAudit({
    action: "NOTE_SIGNED",
    entity: "ClinicalNote",
    entityId: updated.id,
    userId: actor.id,
    details: { signedAt: updated.signedAt },
  })

  redirect(buildUrl(redirectTo, { message: "Note signed." }))
}

export async function deleteNoteAction(
  noteId: string,
  patientUserId: string
) {
  const actor = await requireCurrentAppUser()
  requirePermission(actor.role, "notes:create")

  const redirectBase = `/clinical/patients/${patientUserId}/notes`

  const note = await db.clinicalNote.findUnique({
    where: { id: noteId },
    select: { id: true, status: true, providerId: true },
  })

  if (!note) {
    redirect(buildUrl(redirectBase, { error: "Note not found." }))
  }

  if (note.providerId !== actor.id) {
    redirect(buildUrl(redirectBase, { error: "You can only delete your own notes." }))
  }

  if (note.status !== NoteStatus.DRAFT) {
    redirect(
      buildUrl(redirectBase, { error: "Only draft notes can be deleted." })
    )
  }

  await db.clinicalNote.delete({ where: { id: noteId } })

  await logAudit({
    action: "NOTE_DELETED",
    entity: "ClinicalNote",
    entityId: noteId,
    userId: actor.id,
    details: { patientUserId },
  })

  redirect(buildUrl(redirectBase, { message: "Note deleted." }))
}
