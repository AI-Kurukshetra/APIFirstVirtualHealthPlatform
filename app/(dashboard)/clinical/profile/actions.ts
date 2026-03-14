"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { parseDelimitedList } from "@/lib/provider/profile"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : null
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const query = url.searchParams.toString()

  return `${url.pathname}${query ? `?${query}` : ""}`
}

export async function saveProviderProfileAction(formData: FormData) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical/profile")

  const redirectTo =
    getSafeRedirectPath(getString(formData, "redirectTo")) ??
    "/clinical/profile/edit"
  const title = getString(formData, "title")
  const specialty = parseDelimitedList(getString(formData, "specialty"))
  const licenseNumber = getString(formData, "licenseNumber")
  const licenseState = getString(formData, "licenseState")
  const npiNumber = getString(formData, "npiNumber")
  const bio = getString(formData, "bio")
  const education = getString(formData, "education")
  const languages = parseDelimitedList(getString(formData, "languages"))
  const avatarUrl = getString(formData, "avatarUrl")
  const acceptingNew = formData.get("acceptingNew") === "on"

  await db.$transaction([
    db.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        acceptingNew,
        bio: bio || null,
        education: education || null,
        languages,
        licenseNumber: licenseNumber || null,
        licenseState: licenseState || null,
        npiNumber: npiNumber || null,
        specialty,
        title: title || null,
      },
      create: {
        acceptingNew,
        bio: bio || null,
        education: education || null,
        languages,
        licenseNumber: licenseNumber || null,
        licenseState: licenseState || null,
        npiNumber: npiNumber || null,
        specialty,
        title: title || null,
        userId: user.id,
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: avatarUrl || null,
      },
    }),
  ])

  await logAudit({
    action: "PROVIDER_PROFILE_UPDATED",
    details: {
      acceptingNew,
      specialtyCount: specialty.length,
    },
    entity: "ProviderProfile",
    entityId: user.id,
    userId: user.id,
  })

  redirect(
    buildUrl("/clinical/profile", {
      message: "Provider profile saved.",
    })
  )
}
