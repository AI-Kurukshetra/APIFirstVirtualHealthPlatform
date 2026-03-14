import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

interface AuditLogsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin/audit-logs")
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const page = Math.max(
    1,
    Number(typeof params.page === "string" ? params.page : "1") || 1
  )
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = query
    ? {
        OR: [
          { action: { contains: query, mode: "insensitive" as const } },
          { entity: { contains: query, mode: "insensitive" as const } },
          { ipAddress: { contains: query, mode: "insensitive" as const } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
          {
            user: {
              firstName: { contains: query, mode: "insensitive" as const },
            },
          },
          {
            user: {
              lastName: { contains: query, mode: "insensitive" as const },
            },
          },
        ],
      }
    : undefined

  const [logs, totalCount] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const buildPageHref = (targetPage: number) => {
    const nextParams = new URLSearchParams()

    if (query) {
      nextParams.set("q", query)
    }

    nextParams.set("page", String(targetPage))

    return `/admin/audit-logs?${nextParams.toString()}`
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Audit trail
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Authentication lifecycle events are logged with user, IP, and request
          metadata. This page is intentionally read-only.
        </p>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary"
            defaultValue={query}
            name="q"
            placeholder="Search action, entity, user, or IP"
            type="search"
          />
          <Button type="submit">Filter logs</Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">When</th>
                <th className="px-5 py-4 font-medium">Action</th>
                <th className="px-5 py-4 font-medium">Entity</th>
                <th className="px-5 py-4 font-medium">Actor</th>
                <th className="px-5 py-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    No audit events matched the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr className="align-top" key={log.id}>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(log.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-medium">{log.action}</td>
                    <td className="px-5 py-4">
                      <div>{log.entity}</div>
                      {log.entityId ? (
                        <div className="mt-1 font-mono text-xs text-muted-foreground">
                          {log.entityId}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      {log.user ? (
                        <div>
                          <div className="font-medium">
                            {log.user.firstName} {log.user.lastName}
                          </div>
                          <div className="text-muted-foreground">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {log.ipAddress ?? "Unknown"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages} · {totalCount} total event
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
