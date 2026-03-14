import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { BreadcrumbLabel } from "@/components/layout/breadcrumb-label"
import { db } from "@/lib/db"
import { ensurePathAccess, getRoleLabel, requireCurrentAppUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function formatTimestamp(value: Date | null) {
  if (!value) {
    return "Not yet"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: AdminUserDetailPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/admin/users")

  const [{ id }, paramsData] = await Promise.all([params, searchParams])
  const user = await db.user.findUnique({
    where: { id },
    include: {
      patientProfile: {
        select: {
          id: true,
          onboardingCompleted: true,
        },
      },
      providerProfile: {
        select: {
          id: true,
          specialty: true,
          title: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const message =
    typeof paramsData.message === "string" ? paramsData.message : undefined
  const error = typeof paramsData.error === "string" ? paramsData.error : undefined

  const { toggleAdminUserStatusAction, resendInviteAction } = await import(
    "@/app/(dashboard)/admin/users/actions"
  )

  return (
    <section className="grid gap-6">
      <BreadcrumbLabel segment={id} label={`${user.firstName} ${user.lastName}`} />
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/users">Back to users</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/users/${user.id}/edit`}>Edit user</Link>
            </Button>
          </div>
        </div>

        {message ? (
          <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Role
            </div>
            <div className="mt-3 text-lg font-semibold">
              {getRoleLabel(user.role)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </div>
            <div className="mt-3 text-lg font-semibold">
              {user.isActive ? "Active" : "Inactive"}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Last sign-in
            </div>
            <div className="mt-3 text-lg font-semibold">
              {formatTimestamp(user.lastLoginAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Created
            </div>
            <div className="mt-3 text-lg font-semibold">
              {formatTimestamp(user.createdAt)}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">User profile</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">First name</dt>
                <dd>{user.firstName}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Last name</dt>
                <dd>{user.lastName}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Supabase auth ID</dt>
                <dd className="font-mono text-xs text-muted-foreground">
                  {user.supabaseId}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Linked phase data</h2>
            <div className="mt-5 grid gap-4 text-sm">
              <div className="rounded-2xl border border-border p-4">
                <div className="text-muted-foreground">Provider profile</div>
                <div className="mt-2 font-medium">
                  {user.providerProfile
                    ? `${user.providerProfile.title ?? "Profile started"}`
                    : "Not created"}
                </div>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="text-muted-foreground">Patient onboarding</div>
                <div className="mt-2 font-medium">
                  {user.patientProfile
                    ? user.patientProfile.onboardingCompleted
                      ? "Completed"
                      : "In progress"
                    : "Not started"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <form
                action={resendInviteAction.bind(
                  null,
                  user.id,
                  `/admin/users/${user.id}`
                )}
              >
                <Button type="submit" variant="outline">
                  Resend invite
                </Button>
              </form>
              <form
                action={toggleAdminUserStatusAction.bind(
                  null,
                  user.id,
                  !user.isActive,
                  `/admin/users/${user.id}`
                )}
              >
                <Button type="submit" variant={user.isActive ? "destructive" : "default"}>
                  {user.isActive ? "Deactivate account" : "Reactivate account"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
