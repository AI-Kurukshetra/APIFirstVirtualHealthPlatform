import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import {
  ensurePathAccess,
  requireCurrentAppUser,
} from "@/lib/auth/session"
import { stringifyDelimitedList } from "@/lib/provider/profile"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface AdminProviderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminProviderDetailPage({
  params,
}: AdminProviderDetailPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/admin")

  const { id } = await params
  const provider = await db.user.findFirst({
    where: {
      id,
      role: Role.PROVIDER,
    },
    include: {
      providerProfile: true,
    },
  })

  if (!provider) {
    notFound()
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {provider.firstName} {provider.lastName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {provider.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/providers">Back to providers</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/users/${provider.id}`}>Open user record</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Profile summary</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Professional title</dt>
                <dd>{provider.providerProfile?.title || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Biography</dt>
                <dd>{provider.providerProfile?.bio || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Education</dt>
                <dd>{provider.providerProfile?.education || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Languages</dt>
                <dd>
                  {provider.providerProfile?.languages.length
                    ? stringifyDelimitedList(provider.providerProfile.languages)
                    : "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Credentialing</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">License number</dt>
                <dd>
                  {provider.providerProfile?.licenseNumber || "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">License state</dt>
                <dd>
                  {provider.providerProfile?.licenseState || "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">NPI number</dt>
                <dd>{provider.providerProfile?.npiNumber || "Not provided"}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Specialties</dt>
                <dd>
                  {provider.providerProfile?.specialty.length
                    ? stringifyDelimitedList(provider.providerProfile.specialty)
                    : "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Accepting new patients</dt>
                <dd>{provider.providerProfile?.acceptingNew ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
