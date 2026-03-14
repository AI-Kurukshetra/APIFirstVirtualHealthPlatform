import Link from "next/link"

import { Button } from "@/components/ui/button"
import { UserForm } from "@/components/admin/user-form"
import { getInvitableRoles } from "@/lib/admin/user-management"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"
import { hasSupabaseAdminAccess } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

interface AdminNewUserPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminNewUserPage({
  searchParams,
}: AdminNewUserPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin/users")

  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : undefined

  const { createAdminUserAction } = await import("@/app/(dashboard)/admin/users/actions")

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Invite a user
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Send an email invite and pre-assign the target role before first
              sign-in.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/users">Back to users</Link>
          </Button>
        </div>

        {!hasSupabaseAdminAccess() ? (
          <p className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
            Configure `SUPABASE_SERVICE_ROLE_KEY` before using the invite flow.
          </p>
        ) : null}

        <div className="mt-8 max-w-2xl">
          <UserForm
            action={createAdminUserAction}
            allowedRoles={getInvitableRoles(user.role)}
            error={error}
            redirectTo="/admin/users/new"
            submitLabel="Send invite"
          />
        </div>
      </div>
    </section>
  )
}
