import { type User } from "@/prisma/generated/client"

import { SessionTimeout } from "@/components/auth/session-timeout"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Sidebar } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { getPermissionsForRole } from "@/lib/auth/guards"
import { NAV_ITEMS } from "@/lib/config/navigation"

interface DashboardShellProps {
  user: User
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const navigationItems = NAV_ITEMS.filter((item) =>
    getPermissionsForRole(user.role).includes(item.requiredPermission)
  )

  return (
    <div className="min-h-svh bg-muted/30">
      <SessionTimeout />
      <div className="grid min-h-svh lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Sidebar role={user.role} />
        </div>
        <div className="flex min-h-svh flex-col">
          <TopNav navigationItems={navigationItems} user={user} />
          <main className="flex-1 px-6 py-6">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
