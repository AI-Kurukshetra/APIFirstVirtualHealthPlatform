import Link from "next/link"

import { forgotPasswordAction } from "@/app/(auth)/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { SubmitButton } from "@/components/auth/submit-button"

export const dynamic = "force-dynamic"

interface ForgotPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams
  const error =
    typeof params.error === "string" ? params.error : undefined
  const message =
    typeof params.message === "string" ? params.message : undefined

  return (
    <AuthShell
      description="We will send a reset link to the email address on file."
      eyebrow="Recovery"
      title="Reset your password"
    >
      <form action={forgotPasswordAction} className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            name="email"
            required
            type="email"
          />
        </label>
        {error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </p>
        ) : null}
        <SubmitButton>Send reset link</SubmitButton>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/login">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
