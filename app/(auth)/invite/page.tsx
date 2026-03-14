"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"

export default function InviteCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.slice(1)

    if (!hash) {
      router.replace("/login?error=The+invitation+link+is+invalid+or+expired.")
      return
    }

    const params = new URLSearchParams(hash)

    // Supabase puts errors in the hash when the token has expired or is invalid
    const hashError = params.get("error")
    const hashErrorCode = params.get("error_code")
    if (hashError) {
      const description =
        hashErrorCode === "otp_expired"
          ? "This link has expired. Please request a new one."
          : params.get("error_description") ?? "The link is invalid or expired."
      router.replace("/login?error=" + encodeURIComponent(description))
      return
    }

    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    const type = params.get("type") // "invite" | "recovery" | undefined

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=The+invitation+link+is+invalid+or+expired.")
      return
    }

    const supabase = createBrowserSupabaseClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace("/login?error=" + encodeURIComponent(error.message))
          return
        }

        if (type === "recovery") {
          // Password reset email sent by admin (resend invite on confirmed account)
          router.replace("/reset-password")
        } else {
          // Invite email — user must create their own password to activate account
          router.replace("/reset-password?invite=1")
        }
      })
  }, [router])

  return (
    <AuthShell
      eyebrow="Welcome"
      title="Setting up your account…"
      description="Please wait while we verify your link."
    >
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </AuthShell>
  )
}
