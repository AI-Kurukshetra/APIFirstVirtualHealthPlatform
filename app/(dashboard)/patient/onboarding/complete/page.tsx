import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function PatientOnboardingCompletePage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/patient/onboarding")

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Patient
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Onboarding complete
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Your demographic and medical basics are now saved. You can revisit
          your profile later if anything changes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/patient">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patient/profile">View profile</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
