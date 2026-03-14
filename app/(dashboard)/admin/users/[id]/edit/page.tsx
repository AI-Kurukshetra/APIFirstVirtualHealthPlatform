import Link from "next/link"
import { notFound } from "next/navigation"

import { UserForm } from "@/components/admin/user-form"
import { Button } from "@/components/ui/button"
import { getInvitableRoles } from "@/lib/admin/user-management"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

interface AdminEditUserPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminEditUserPage({
  params,
  searchParams,
}: AdminEditUserPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/admin/users")

  const [{ id }, paramsData] = await Promise.all([params, searchParams])
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      isActive: true,
      lastName: true,
      role: true,
      timezone: true,
    },
  })

  if (!user) {
    notFound()
  }

  const error = typeof paramsData.error === "string" ? paramsData.error : undefined
  const { updateAdminUserAction } = await import(
    "@/app/(dashboard)/admin/users/actions"
  )

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Edit user
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Update the user profile, assigned role, and account status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/admin/users/${user.id}`}>Back to profile</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 max-w-2xl">
          <UserForm
            action={updateAdminUserAction.bind(null, user.id)}
            allowedRoles={getInvitableRoles(currentUser.role)}
            error={error}
            initialValues={{
              email: user.email,
              firstName: user.firstName,
              isActive: user.isActive,
              lastName: user.lastName,
              role: user.role,
              timezone: user.timezone,
            }}
            redirectTo={`/admin/users/${user.id}/edit`}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </section>
  )
}
