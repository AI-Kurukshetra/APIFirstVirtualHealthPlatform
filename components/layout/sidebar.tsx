import Link from "next/link"
import {
  BarChart3,
  Calendar,
  FileText,
  HeartHandshake,
  LayoutGrid,
  MessageSquare,
  Settings,
  Shield,
  TestTube,
  Users,
  Wallet,
  Workflow,
  Pill,
} from "lucide-react"

import { type Role } from "@/prisma/generated/client"

import { getPermissionsForRole } from "@/lib/auth/guards"
import { NAV_ITEMS, type NavIcon } from "@/lib/config/navigation"

const iconMap: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
  "bar-chart": BarChart3,
  calendar: Calendar,
  "file-text": FileText,
  heart: HeartHandshake,
  layout: LayoutGrid,
  "message-square": MessageSquare,
  pill: Pill,
  send: HeartHandshake,
  settings: Settings,
  shield: Shield,
  "test-tube": TestTube,
  users: Users,
  wallet: Wallet,
  workflow: Workflow,
}

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const permissions = getPermissionsForRole(role)
  const visibleItems = NAV_ITEMS.filter((item) =>
    permissions.includes(item.requiredPermission)
  )

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card/70 px-4 py-6">
      <div className="px-3">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Workspace
        </p>
        <p className="mt-3 text-lg font-semibold">Healthie Console</p>
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon]

          return (
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
        Access is permission-driven. Route checks run on the server against the
        Prisma role record.
      </div>
    </aside>
  )
}
