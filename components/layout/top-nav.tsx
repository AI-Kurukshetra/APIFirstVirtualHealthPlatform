import { signOutAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { type User } from "@/prisma/generated/client"
import { type NavItem } from "@/lib/config/navigation"
import { getRoleLabel } from "@/lib/auth/session"

import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"

interface TopNavProps {
  user: User
  navigationItems: NavItem[]
}

export function TopNav({ user, navigationItems }: TopNavProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <MobileNav items={navigationItems} />
        <div>
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {getRoleLabel(user.role)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  )
}
