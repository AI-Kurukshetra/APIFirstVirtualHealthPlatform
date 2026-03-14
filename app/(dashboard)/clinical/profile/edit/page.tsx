import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProviderProfileForm } from "@/components/provider/provider-profile-form"
import { db } from "@/lib/db"
import {
  ensurePathAccess,
  requireCurrentAppUser,
} from "@/lib/auth/session"
import { stringifyDelimitedList } from "@/lib/provider/profile"

export const dynamic = "force-dynamic"

interface ClinicalProfileEditPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClinicalProfileEditPage({
  searchParams,
}: ClinicalProfileEditPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical/profile")

  const [profile, params] = await Promise.all([
    db.providerProfile.findUnique({
      where: { userId: user.id },
    }),
    searchParams,
  ])

  const error = typeof params.error === "string" ? params.error : undefined
  const { saveProviderProfileAction } = await import(
    "@/app/(dashboard)/clinical/profile/actions"
  )

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Clinical
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {profile ? "Edit provider profile" : "Complete provider profile"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              These details feed the provider directory and downstream
              scheduling workflows.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/clinical/profile">Back to profile</Link>
          </Button>
        </div>

        <div className="mt-8 max-w-3xl">
          <ProviderProfileForm
            action={saveProviderProfileAction}
            error={error}
            initialValues={{
              acceptingNew: profile?.acceptingNew ?? true,
              avatarUrl: user.avatarUrl ?? "",
              bio: profile?.bio ?? "",
              education: profile?.education ?? "",
              languages: stringifyDelimitedList(profile?.languages),
              licenseNumber: profile?.licenseNumber ?? "",
              licenseState: profile?.licenseState ?? "",
              npiNumber: profile?.npiNumber ?? "",
              specialty: stringifyDelimitedList(profile?.specialty),
              title: profile?.title ?? "",
            }}
            redirectTo="/clinical/profile/edit"
            submitLabel="Save provider profile"
          />
        </div>
      </div>
    </section>
  )
}
