import Link from "next/link"

import { resetPasswordAction } from "@/app/(auth)/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { SubmitButton } from "@/components/auth/submit-button"

export const dynamic = "force-dynamic"

interface ResetPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const error =
    typeof params.error === "string" ? params.error : undefined

  return (
    <AuthShell
      description="Choose a new password for your account. The link must still be active."
      eyebrow="Reset Password"
      title="Set a new password"
    >
      <form action={resetPasswordAction} className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          New password
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Confirm password
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
        {error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <SubmitButton>Update password</SubmitButton>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/login">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
