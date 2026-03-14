import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import {
  ensurePathAccess,
  requireCurrentAppUser,
} from "@/lib/auth/session"
import {
  getProviderProfileCompleteness,
  stringifyDelimitedList,
} from "@/lib/provider/profile"

export const dynamic = "force-dynamic"

interface ClinicalProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClinicalProfilePage({
  searchParams,
}: ClinicalProfilePageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical/profile")

  const [profile, params] = await Promise.all([
    db.providerProfile.findUnique({
      where: { userId: user.id },
    }),
    searchParams,
  ])

  const message = typeof params.message === "string" ? params.message : undefined
  const completeness = profile
    ? getProviderProfileCompleteness({
        bio: profile.bio,
        education: profile.education,
        languages: profile.languages,
        licenseNumber: profile.licenseNumber,
        npiNumber: profile.npiNumber,
        specialty: profile.specialty,
        title: profile.title,
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
              Provider profile
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Keep licensure, specialties, and provider-facing profile details
              current so scheduling and patient intake stay consistent.
            </p>
          </div>
          <Button asChild>
            <Link href="/clinical/profile/edit">
              {profile ? "Edit profile" : "Set up profile"}
            </Link>
          </Button>
        </div>

        {message ? (
          <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </p>
        ) : null}

        {!profile ? (
          <p className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            This profile is not complete yet. Finish setup to populate the
            provider directory for admin operations.
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Completion
            </div>
            <div className="mt-3 text-3xl font-semibold">{completeness}%</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Specialties
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {profile?.specialty.length ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Languages
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {profile?.languages.length ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Accepting new
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {profile?.acceptingNew ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Professional details</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Title</dt>
                <dd>{profile?.title || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Specialties</dt>
                <dd>
                  {profile?.specialty.length
                    ? stringifyDelimitedList(profile.specialty)
                    : "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Bio</dt>
                <dd>{profile?.bio || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Education</dt>
                <dd>{profile?.education || "Not provided"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Credentials</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">License number</dt>
                <dd>{profile?.licenseNumber || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">License state</dt>
                <dd>{profile?.licenseState || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">NPI number</dt>
                <dd>{profile?.npiNumber || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Languages</dt>
                <dd>
                  {profile?.languages.length
                    ? stringifyDelimitedList(profile.languages)
                    : "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
