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
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface AdminProvidersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminProvidersPage({
  searchParams,
}: AdminProvidersPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin")

  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""

  const where = {
    role: Role.PROVIDER,
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" as const } },
            { firstName: { contains: query, mode: "insensitive" as const } },
            { lastName: { contains: query, mode: "insensitive" as const } },
            {
              providerProfile: {
                specialty: {
                  has: query,
                },
              },
            },
          ],
        }
      : {}),
  }

  const [providers, totalProviders, acceptingNewCount] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        providerProfile: true,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.user.count({ where: { role: Role.PROVIDER } }),
    db.user.count({
      where: {
        role: Role.PROVIDER,
        providerProfile: {
          is: {
            acceptingNew: true,
          },
        },
      },
    }),
  ])

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Providers
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Review directory readiness, specialties, and provider profile
              completion from one list.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/users/new">Invite provider</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total providers
            </div>
            <div className="mt-3 text-3xl font-semibold">{totalProviders}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Accepting new
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {acceptingNewCount}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Setup pending
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {providers.filter((provider) => !provider.providerProfile).length}
            </div>
          </div>
        </div>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={query}
            name="q"
            placeholder="Search provider name, email, or specialty"
            type="search"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="grid gap-4">
        {providers.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
            No providers matched the current filter.
          </div>
        ) : (
          providers.map((provider) => {
            const profile = provider.providerProfile
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
              <article
                className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                key={provider.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {provider.firstName} {provider.lastName}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {provider.email}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/providers/${provider.id}`}>Open</Link>
                  </Button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Completion
                    </div>
                    <div className="mt-2 text-lg font-semibold">{completeness}%</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Title
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {profile?.title || "Pending"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Specialties
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {profile?.specialty.length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Accepting new
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {profile?.acceptingNew ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                  {profile?.specialty.length
                    ? stringifyDelimitedList(profile.specialty)
                    : "No specialties added yet."}
                </p>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
