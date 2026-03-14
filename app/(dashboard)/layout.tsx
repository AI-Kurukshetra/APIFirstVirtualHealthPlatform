import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireCurrentAppUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireCurrentAppUser()

  return <DashboardShell user={user}>{children}</DashboardShell>
}
