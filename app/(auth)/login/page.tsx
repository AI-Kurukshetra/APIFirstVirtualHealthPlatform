import Link from "next/link"

import { signInAction } from "@/app/(auth)/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { SubmitButton } from "@/components/auth/submit-button"
import { getCurrentAppUser, getDefaultDashboardPath } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const appUser = await getCurrentAppUser()

  if (appUser) {
    redirect(getDefaultDashboardPath(appUser.role))
  }

  const params = await searchParams
  const error =
    typeof params.error === "string" ? params.error : undefined
  const message =
    typeof params.message === "string" ? params.message : undefined
  const next = typeof params.next === "string" ? params.next : ""

  return (
    <AuthShell
      description="Use your Healthie credentials to access the role-aware workspace."
      eyebrow="Welcome Back"
      title="Sign in securely"
    >
      <form action={signInAction} className="grid gap-5">
        <input name="next" type="hidden" value={next} />
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            name="email"
            placeholder="doctor@healthie.app"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            name="password"
            required
            type="password"
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
        <SubmitButton>Sign in</SubmitButton>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="hover:text-foreground" href="/register">
          Create account
        </Link>
      </div>
    </AuthShell>
  )
}
