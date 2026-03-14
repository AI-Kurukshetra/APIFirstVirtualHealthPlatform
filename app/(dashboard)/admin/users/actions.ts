"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getRequestMetadata, logAudit } from "@/lib/audit"
import { requirePermission } from "@/lib/auth/guards"
import { getRoleLabel, requireCurrentAppUser } from "@/lib/auth/session"
import {
  canManageRole,
  getInvitableRoles,
} from "@/lib/admin/user-management"
import { Role } from "@/prisma/generated/client"
import { createSupabaseAdminClient, hasSupabaseAdminAccess } from "@/lib/supabase/admin"
import { env } from "@/lib/env"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost")

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const query = url.searchParams.toString()

  return `${url.pathname}${query ? `?${query}` : ""}`
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : null
}

function parseRole(value: string) {
  return Object.values(Role).includes(value as Role) ? (value as Role) : null
}

async function getRequestOrigin() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get("origin")

  if (origin) {
    return origin
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")

  if (host) {
    return `${protocol}://${host}`
  }

  return env.appUrl
}

async function requireAdminManager() {
  const actor = await requireCurrentAppUser()

  return actor
}

export async function createAdminUserAction(formData: FormData) {
  const actor = await requireAdminManager()
  requirePermission(actor.role, "users:create")
  const redirectTo =
    getSafeRedirectPath(getString(formData, "redirectTo")) ?? "/admin/users/new"
  const firstName = getString(formData, "firstName")
  const lastName = getString(formData, "lastName")
  const email = getString(formData, "email").toLowerCase()
  const role = parseRole(getString(formData, "role"))
  const invitableRoles = getInvitableRoles(actor.role)

  if (!firstName || !lastName || !email || !role) {
    redirect(buildUrl(redirectTo, { error: "Complete all required fields." }))
  }

  if (!invitableRoles.includes(role)) {
    redirect(
      buildUrl(redirectTo, {
        error: "You do not have permission to create that user role.",
      })
    )
  }

  if (!hasSupabaseAdminAccess()) {
    redirect(
      buildUrl(redirectTo, {
        error:
          "User invites require SUPABASE_SERVICE_ROLE_KEY to be configured on the server.",
      })
    )
  }

  const existingUser = await db.user.findUnique({ where: { email } })

  if (existingUser) {
    redirect(
      buildUrl(redirectTo, {
        error: "A user with that email already exists.",
      })
    )
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const requestOrigin = await getRequestOrigin()
  const { data: inviteData, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
      redirectTo: new URL("/invite", requestOrigin).toString(),
    })

  if (inviteError || !inviteData.user) {
    redirect(
      buildUrl(redirectTo, {
        error: inviteError?.message ?? "Could not send the user invitation.",
      })
    )
  }

  const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
    inviteData.user.id,
    {
      app_metadata: {
        role,
      },
    }
  )

  const createdUser = await db.user.create({
    data: {
      email,
      firstName,
      isActive: true,
      lastName,
      role,
      supabaseId: inviteData.user.id,
    },
  })

  const requestMetadata = await getRequestMetadata()

  await logAudit({
    action: "USER_INVITED",
    details: {
      email,
      ipAddress: requestMetadata.ipAddress,
      metadataUpdateError: metadataError?.message ?? null,
      role,
    },
    entity: "User",
    entityId: createdUser.id,
    userId: actor.id,
  })

  redirect(
    buildUrl(`/admin/users/${createdUser.id}`, {
      message: `Invite sent to ${email} for the ${getRoleLabel(role)} role.`,
    })
  )
}

export async function updateAdminUserAction(userId: string, formData: FormData) {
  const actor = await requireAdminManager()
  requirePermission(actor.role, "users:update")
  const redirectTo =
    getSafeRedirectPath(getString(formData, "redirectTo")) ??
    `/admin/users/${userId}/edit`
  const firstName = getString(formData, "firstName")
  const lastName = getString(formData, "lastName")
  const email = getString(formData, "email").toLowerCase()
  const role = parseRole(getString(formData, "role"))
  const status = getString(formData, "status")

  if (!firstName || !lastName || !email || !role) {
    redirect(buildUrl(redirectTo, { error: "Complete all required fields." }))
  }

  if (!canManageRole(actor.role, role)) {
    redirect(
      buildUrl(redirectTo, {
        error: "You do not have permission to assign that user role.",
      })
    )
  }

  const user = await db.user.findUnique({ where: { id: userId } })

  if (!user) {
    redirect(buildUrl("/admin/users", { error: "User not found." }))
  }

  if (actor.id === user.id && (role !== user.role || status === "inactive")) {
    redirect(
      buildUrl(redirectTo, {
        error: "You cannot deactivate yourself or remove your own admin access.",
      })
    )
  }

  if (user.email !== email && !hasSupabaseAdminAccess()) {
    redirect(
      buildUrl(redirectTo, {
        error:
          "Changing email addresses requires SUPABASE_SERVICE_ROLE_KEY on the server.",
      })
    )
  }

  const isActive = status !== "inactive"
  const timezone = getString(formData, "timezone") || "UTC"
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      email,
      firstName,
      isActive,
      lastName,
      role,
      timezone,
    },
  })

  if (hasSupabaseAdminAccess()) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { error: syncError } = await supabaseAdmin.auth.admin.updateUserById(
      user.supabaseId,
      {
        app_metadata: {
          role,
        },
        email: user.email === email ? undefined : email,
        user_metadata: {
          first_name: firstName,
          full_name: `${firstName} ${lastName}`,
          last_name: lastName,
        },
      }
    )

    if (syncError) {
      redirect(
        buildUrl(redirectTo, {
          error: syncError.message,
        })
      )
    }
  }

  await logAudit({
    action: "USER_UPDATED",
    details: {
      email: updatedUser.email,
      isActive: updatedUser.isActive,
      role: updatedUser.role,
    },
    entity: "User",
    entityId: updatedUser.id,
    userId: actor.id,
  })

  redirect(
    buildUrl(`/admin/users/${updatedUser.id}`, {
      message: "User details updated.",
    })
  )
}

export async function resendInviteAction(userId: string, redirectTo: string) {
  const actor = await requireAdminManager()
  requirePermission(actor.role, "users:create")
  const safeRedirect = getSafeRedirectPath(redirectTo) ?? "/admin/users"

  if (!hasSupabaseAdminAccess()) {
    redirect(
      buildUrl(safeRedirect, {
        error: "Resending invites requires SUPABASE_SERVICE_ROLE_KEY to be configured.",
      })
    )
  }

  const user = await db.user.findUnique({ where: { id: userId } })

  if (!user) {
    redirect(buildUrl("/admin/users", { error: "User not found." }))
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const requestOrigin = await getRequestOrigin()

  const { data: authUser, error: lookupError } =
    await supabaseAdmin.auth.admin.getUserById(user.supabaseId)

  if (lookupError || !authUser.user) {
    redirect(buildUrl(safeRedirect, { error: "Could not look up auth account." }))
  }

  const isConfirmed = !!authUser.user.email_confirmed_at

  if (isConfirmed) {
    // Account is confirmed but has no password — send a password reset email
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      user.email,
      { redirectTo: new URL("/invite", requestOrigin).toString() }
    )
    if (resetError) {
      redirect(buildUrl(safeRedirect, { error: resetError.message }))
    }
  } else {
    // Account is unconfirmed — resend the invite email
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      user.email,
      { redirectTo: new URL("/invite", requestOrigin).toString() }
    )
    if (inviteError) {
      redirect(buildUrl(safeRedirect, { error: inviteError.message }))
    }
  }

  const requestMetadata = await getRequestMetadata()

  await logAudit({
    action: "USER_INVITE_RESENT",
    details: {
      email: user.email,
      ipAddress: requestMetadata.ipAddress,
      role: user.role,
    },
    entity: "User",
    entityId: user.id,
    userId: actor.id,
  })

  redirect(
    buildUrl(safeRedirect, {
      message: isConfirmed
        ? `Password setup link sent to ${user.email}.`
        : `Invite resent to ${user.email}.`,
    })
  )
}

export async function toggleAdminUserStatusAction(
  userId: string,
  nextIsActive: boolean,
  redirectTo: string
) {
  const actor = await requireAdminManager()
  requirePermission(actor.role, "users:deactivate")
  const safeRedirect = getSafeRedirectPath(redirectTo) ?? "/admin/users"
  const user = await db.user.findUnique({ where: { id: userId } })

  if (!user) {
    redirect(buildUrl("/admin/users", { error: "User not found." }))
  }

  if (actor.id === user.id && !nextIsActive) {
    redirect(
      buildUrl(safeRedirect, {
        error: "You cannot deactivate your own account.",
      })
    )
  }

  await db.user.update({
    where: { id: user.id },
    data: { isActive: nextIsActive },
  })

  await logAudit({
    action: nextIsActive ? "USER_REACTIVATED" : "USER_DEACTIVATED",
    details: {
      email: user.email,
      role: user.role,
    },
    entity: "User",
    entityId: user.id,
    userId: actor.id,
  })

  redirect(
    buildUrl(safeRedirect, {
      message: nextIsActive ? "User reactivated." : "User deactivated.",
    })
  )
}
