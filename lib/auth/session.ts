import { cache } from "react"
import { redirect } from "next/navigation"
import { type User as SupabaseUser } from "@supabase/supabase-js"

import { Role, type User as AppUser } from "@/prisma/generated/client"

import { db } from "@/lib/db"
import { canAccessPath } from "@/lib/auth/route-access"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const validRoles = new Set<string>(Object.values(Role))

function parseRole(input: unknown) {
  if (typeof input !== "string") {
    return Role.PATIENT
  }

  return validRoles.has(input) ? (input as Role) : Role.PATIENT
}

function getNamesFromAuthUser(user: SupabaseUser) {
  const firstName =
    typeof user.user_metadata.first_name === "string"
      ? user.user_metadata.first_name.trim()
      : ""
  const lastName =
    typeof user.user_metadata.last_name === "string"
      ? user.user_metadata.last_name.trim()
      : ""

  if (firstName || lastName) {
    return {
      firstName: firstName || "Member",
      lastName: lastName || "User",
    }
  }

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : ""

  if (fullName) {
    const [first, ...rest] = fullName.split(/\s+/)

    return {
      firstName: first || "Member",
      lastName: rest.join(" ") || "User",
    }
  }

  return {
    firstName: "Member",
    lastName: "User",
  }
}

interface SyncAppUserOptions {
  touchLoginAt?: boolean
}

export async function syncAppUser(
  authUser: SupabaseUser,
  options: SyncAppUserOptions = {}
) {
  if (!authUser.email) {
    throw new Error("Authenticated user is missing an email address.")
  }

  const { firstName, lastName } = getNamesFromAuthUser(authUser)
  const fallbackRole = parseRole(authUser.app_metadata.role)
  const avatarUrl =
    typeof authUser.user_metadata.avatar_url === "string"
      ? authUser.user_metadata.avatar_url
      : null

  const existingUser = await db.user.findUnique({
    where: { supabaseId: authUser.id },
  })

  if (existingUser) {
    return db.user.update({
      where: { id: existingUser.id },
      data: {
        email: authUser.email,
        firstName,
        lastName,
        avatarUrl,
        ...(options.touchLoginAt ? { lastLoginAt: new Date() } : {}),
      },
    })
  }

  return db.user.create({
    data: {
      supabaseId: authUser.id,
      email: authUser.email,
      firstName,
      lastName,
      avatarUrl,
      role: fallbackRole,
      lastLoginAt: new Date(),
    },
  })
}

export const getSessionContext = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const appUser = await syncAppUser(authUser)

  return {
    authUser,
    appUser,
  }
})

export async function getCurrentAppUser() {
  const context = await getSessionContext()

  return context?.appUser ?? null
}

export async function requireCurrentAppUser() {
  const appUser = await getCurrentAppUser()

  if (!appUser) {
    redirect("/login")
  }

  return appUser
}

export function getDefaultDashboardPath(role: Role) {
  switch (role) {
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
      return "/admin"
    case Role.PROVIDER:
    case Role.NURSE:
      return "/clinical"
    case Role.CARE_COORDINATOR:
      return "/coordination"
    case Role.STAFF:
      return "/front-desk"
    case Role.PATIENT:
    default:
      return "/patient"
  }
}

export function getRoleLabel(role: Role) {
  return role
    .split("_")
    .map((segment) => segment[0] + segment.slice(1).toLowerCase())
    .join(" ")
}

export function ensurePathAccess(user: AppUser, pathname: string) {
  if (!canAccessPath(user.role, pathname)) {
    redirect("/403")
  }
}
