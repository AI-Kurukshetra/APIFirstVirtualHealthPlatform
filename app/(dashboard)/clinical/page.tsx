import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { getProviderProfileCompleteness } from "@/lib/provider/profile"

export default async function ClinicalDashboardPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical")

  const [patientCount, providerProfile] = await Promise.all([
    db.user.count({
      where: {
        role: "PATIENT",
      },
    }),
    db.providerProfile.findUnique({
      where: { userId: user.id },
    }),
  ])

  const completeness = providerProfile
    ? getProviderProfileCompleteness({
        bio: providerProfile.bio,
        education: providerProfile.education,
        languages: providerProfile.languages,
        licenseNumber: providerProfile.licenseNumber,
        npiNumber: providerProfile.npiNumber,
        specialty: providerProfile.specialty,
        title: providerProfile.title,
      })
    : 0

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Clinical
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Clinical workspace
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Phase 2 makes this workspace operational with provider profile
              setup and patient directory access.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/clinical/profile">My profile</Link>
            </Button>
            <Button asChild>
              <Link href="/clinical/patients">Patient directory</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Patient records
            </div>
            <div className="mt-3 text-3xl font-semibold">{patientCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile completion
            </div>
            <div className="mt-3 text-3xl font-semibold">{completeness}%</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Directory status
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {providerProfile ? "Ready" : "Setup needed"}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
