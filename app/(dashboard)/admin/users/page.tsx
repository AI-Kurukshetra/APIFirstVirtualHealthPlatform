import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  ADMIN_USER_PAGE_SIZE,
  buildUserManagementWhere,
  parseRoleFilter,
  parseStatusFilter,
} from "@/lib/admin/user-management"
import { db } from "@/lib/db"
import { ensurePathAccess, getRoleLabel, requireCurrentAppUser } from "@/lib/auth/session"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Never"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const currentUser = await requireCurrentAppUser()
  ensurePathAccess(currentUser, "/admin/users")

  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const role = parseRoleFilter(
    typeof params.role === "string" ? params.role : undefined
  )
  const status = parseStatusFilter(
    typeof params.status === "string" ? params.status : undefined
  )
  const page = Math.max(
    1,
    Number(typeof params.page === "string" ? params.page : "1") || 1
  )
  const message =
    typeof params.message === "string" ? params.message : undefined
  const error = typeof params.error === "string" ? params.error : undefined
  const where = buildUserManagementWhere({ query, role, status })
  const skip = (page - 1) * ADMIN_USER_PAGE_SIZE

  const [users, totalCount, activeCount, inactiveCount] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: ADMIN_USER_PAGE_SIZE,
    }),
    db.user.count({ where }),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { isActive: false } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_USER_PAGE_SIZE))
  const { toggleAdminUserStatusAction } = await import(
    "@/app/(dashboard)/admin/users/actions"
  )

  const baseParams = new URLSearchParams()

  if (query) {
    baseParams.set("q", query)
  }

  if (role) {
    baseParams.set("role", role)
  }

  if (status !== "all") {
    baseParams.set("status", status)
  }

  const buildPageHref = (targetPage: number) => {
    const nextParams = new URLSearchParams(baseParams)
    nextParams.set("page", String(targetPage))
    return `/admin/users?${nextParams.toString()}`
  }

  const currentListHref = buildPageHref(page)

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              User management
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Search the directory, review account status, and manage role-aware
              access from one operational queue.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">Invite user</Link>
          </Button>
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

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total users
            </div>
            <div className="mt-3 text-3xl font-semibold">{totalCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Active accounts
            </div>
            <div className="mt-3 text-3xl font-semibold">{activeCount}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inactive accounts
            </div>
            <div className="mt-3 text-3xl font-semibold">{inactiveCount}</div>
          </div>
        </div>

        <form className="mt-8 grid gap-3 lg:grid-cols-[1.3fr_0.6fr_0.6fr_auto]">
          <input
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={query}
            name="q"
            placeholder="Search by name or email"
            type="search"
          />
          <select
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={role ?? ""}
            name="role"
          >
            <option value="">All roles</option>
            {Object.values(Role).map((roleValue) => (
              <option key={roleValue} value={roleValue}>
                {getRoleLabel(roleValue)}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={status}
            name="status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <Button type="submit">Apply filters</Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Last sign-in</th>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    No users matched the current filter.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr className="align-top" key={user.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">{getRoleLabel(user.role)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                            : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/users/${user.id}`}>View</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                        </Button>
                        <form
                          action={toggleAdminUserStatusAction.bind(
                            null,
                            user.id,
                            !user.isActive,
                            currentListHref
                          )}
                        >
                          <Button
                            size="sm"
                            type="submit"
                            variant={user.isActive ? "destructive" : "secondary"}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages} · {totalCount} total user
            {totalCount === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-3">
            <Button asChild disabled={page <= 1} variant="outline">
              <Link href={buildPageHref(Math.max(1, page - 1))}>Previous</Link>
            </Button>
            <Button asChild disabled={page >= totalPages} variant="outline">
              <Link href={buildPageHref(Math.min(totalPages, page + 1))}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
