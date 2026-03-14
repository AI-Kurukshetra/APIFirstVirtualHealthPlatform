import Link from "next/link"
import { redirect } from "next/navigation"

import { signUpAction } from "@/app/(auth)/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { SubmitButton } from "@/components/auth/submit-button"
import { getCurrentAppUser, getDefaultDashboardPath } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const appUser = await getCurrentAppUser()

  if (appUser) {
    redirect(getDefaultDashboardPath(appUser.role))
  }

  const params = await searchParams
  const error =
    typeof params.error === "string" ? params.error : undefined

  return (
    <AuthShell
      description="New accounts default to the patient workspace until role-specific administration is added."
      eyebrow="New Account"
      title="Create your account"
    >
      <form action={signUpAction} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            First name
            <input
              className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
              name="firstName"
              required
              type="text"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Last name
            <input
              className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
              name="lastName"
              required
              type="text"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
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
        <SubmitButton>Create account</SubmitButton>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link className="text-foreground hover:text-primary" href="/login">
          Sign in
        </Link>
      </div>
    </AuthShell>
  )
}
