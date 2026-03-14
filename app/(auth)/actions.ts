"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getRequestMetadata, logAudit } from "@/lib/audit"
import {
  getCurrentAppUser,
  getDefaultDashboardPath,
  syncAppUser,
} from "@/lib/auth/session"
import { env } from "@/lib/env"
import { enforceAuthRateLimit } from "@/lib/security/auth-rate-limit"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const query = searchParams.toString()

  return query ? `${pathname}?${query}` : pathname
}

function getSafeRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : null
}

function getAuthActionErrorMessage(
  error: { code?: string; status?: number } | null | undefined,
  options: {
    fallback: string
    emailRateLimit: string
  }
) {
  if (
    error?.code === "over_email_send_rate_limit" ||
    error?.status === 429
  ) {
    return options.emailRateLimit
  }

  return options.fallback
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

export async function signInAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase()
  const password = getString(formData, "password")
  const next = getSafeRedirectPath(getString(formData, "next"))

  if (!email || !password) {
    redirect(buildUrl("/login", { error: "Enter your email and password." }))
  }

  const requestMetadata = await getRequestMetadata()
  const signInRateLimit = await enforceAuthRateLimit({
    action: "LOGIN",
    identifier: email,
    ipAddress: requestMetadata.ipAddress,
    maxAttempts: 5,
    windowMinutes: 15,
  })

  if (!signInRateLimit.allowed) {
    await logAudit({
      action: "LOGIN_RATE_LIMITED",
      entity: "AuthSession",
      details: { identifier: email, reason: "rate_limit" },
    })

    redirect(
      buildUrl("/login", {
        error: "Too many failed sign-in attempts. Try again in 15 minutes.",
      })
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    await logAudit({
      action: "LOGIN_FAILED",
      entity: "AuthSession",
      details: { identifier: email, reason: "invalid_credentials" },
    })

    redirect(
      buildUrl("/login", {
        error: "We could not sign you in with those credentials.",
      })
    )
  }

  const appUser = await syncAppUser(data.user, { touchLoginAt: true })

  await logAudit({
    userId: appUser.id,
    action: "LOGIN",
    entity: "AuthSession",
    entityId: appUser.id,
    details: { email: appUser.email },
  })

  redirect(next ?? getDefaultDashboardPath(appUser.role))
}

export async function signUpAction(formData: FormData) {
  const firstName = getString(formData, "firstName")
  const lastName = getString(formData, "lastName")
  const email = getString(formData, "email").toLowerCase()
  const password = getString(formData, "password")
  const confirmPassword = getString(formData, "confirmPassword")

  if (!firstName || !lastName || !email || !password) {
    redirect(buildUrl("/register", { error: "Complete all required fields." }))
  }

  if (password.length < 8) {
    redirect(
      buildUrl("/register", {
        error: "Use a password with at least 8 characters.",
      })
    )
  }

  if (password !== confirmPassword) {
    redirect(buildUrl("/register", { error: "Passwords do not match." }))
  }

  const requestMetadata = await getRequestMetadata()
  const signUpRateLimit = await enforceAuthRateLimit({
    action: "REGISTER",
    identifier: email,
    ipAddress: requestMetadata.ipAddress,
    maxAttempts: 3,
    windowMinutes: 30,
  })

  if (!signUpRateLimit.allowed) {
    await logAudit({
      action: "REGISTER_RATE_LIMITED",
      entity: "User",
      details: { identifier: email, reason: "rate_limit" },
    })

    redirect(
      buildUrl("/register", {
        error: "Too many account creation attempts. Try again later.",
      })
    )
  }

  const requestOrigin = await getRequestOrigin()
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: new URL("/auth/callback", requestOrigin).toString(),
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    },
  })

  if (error || !data.user) {
    console.error("Supabase sign-up failed", error)

    await logAudit({
      action: "REGISTER_FAILED",
      entity: "User",
      details: {
        identifier: email,
        reason: "sign_up_error",
        error: error?.message,
        status: error?.status,
        code: error?.code,
      },
    })

    redirect(
      buildUrl("/register", {
        error: getAuthActionErrorMessage(error, {
          fallback: "We could not create your account right now.",
          emailRateLimit:
            "Too many confirmation emails were sent. Wait a few minutes and try again.",
        }),
      })
    )
  }

  const appUser = await syncAppUser(data.user, { touchLoginAt: true })

  await logAudit({
    userId: appUser.id,
    action: "REGISTER",
    entity: "User",
    entityId: appUser.id,
    details: { email: appUser.email, role: appUser.role },
  })

  if (data.session) {
    redirect(getDefaultDashboardPath(appUser.role))
  }

  redirect(
    buildUrl("/login", {
      message: "Check your email to confirm your account before signing in.",
    })
  )
}

export async function forgotPasswordAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase()

  if (!email) {
    redirect(buildUrl("/forgot-password", { error: "Enter your email." }))
  }

  const requestMetadata = await getRequestMetadata()
  const resetRateLimit = await enforceAuthRateLimit({
    action: "PASSWORD_RESET_REQUEST",
    identifier: email,
    ipAddress: requestMetadata.ipAddress,
    maxAttempts: 3,
    windowMinutes: 30,
  })

  if (!resetRateLimit.allowed) {
    await logAudit({
      action: "PASSWORD_RESET_REQUEST_RATE_LIMITED",
      entity: "AuthSession",
      details: { identifier: email, reason: "rate_limit" },
    })

    redirect(
      buildUrl("/forgot-password", {
        error: "Too many reset attempts. Try again later.",
      })
    )
  }

  const requestOrigin = await getRequestOrigin()
  const recoveryUrl = new URL("/auth/callback", requestOrigin)
  recoveryUrl.searchParams.set("next", "/reset-password")

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: recoveryUrl.toString(),
  })

  if (error) {
    console.error("Supabase password reset request failed", error)

    await logAudit({
      action: "PASSWORD_RESET_REQUEST_FAILED",
      entity: "AuthSession",
      details: {
        identifier: email,
        reason: "reset_error",
        error: error.message,
        status: error.status,
        code: error.code,
        redirectTo: recoveryUrl.toString(),
      },
    })

    redirect(
      buildUrl("/forgot-password", {
        error: getAuthActionErrorMessage(error, {
          fallback: "We could not send a reset link right now.",
          emailRateLimit:
            "Too many reset emails were sent. Wait a few minutes and try again.",
        }),
      })
    )
  }

  await logAudit({
    action: "PASSWORD_RESET_REQUEST",
    entity: "AuthSession",
    details: { email },
  })

  redirect(
    buildUrl("/forgot-password", {
      message: "If the account exists, a reset link has been sent.",
    })
  )
}

export async function resetPasswordAction(formData: FormData) {
  const password = getString(formData, "password")
  const confirmPassword = getString(formData, "confirmPassword")

  if (password.length < 8) {
    redirect(
      buildUrl("/reset-password", {
        error: "Use a password with at least 8 characters.",
      })
    )
  }

  if (password !== confirmPassword) {
    redirect(buildUrl("/reset-password", { error: "Passwords do not match." }))
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(
      buildUrl("/reset-password", {
        error: "We could not update your password.",
      })
    )
  }

  const appUser = await getCurrentAppUser()

  await logAudit({
    userId: appUser?.id,
    action: "PASSWORD_RESET_COMPLETE",
    entity: "AuthSession",
    entityId: appUser?.id,
  })

  redirect(
    buildUrl("/login", {
      message: "Password updated. Sign in with your new password.",
    })
  )
}

export async function signOutAction() {
  const appUser = await getCurrentAppUser()
  const supabase = await createServerSupabaseClient()

  await supabase.auth.signOut()

  await logAudit({
    userId: appUser?.id,
    action: "LOGOUT",
    entity: "AuthSession",
    entityId: appUser?.id,
  })

  redirect("/login")
}
