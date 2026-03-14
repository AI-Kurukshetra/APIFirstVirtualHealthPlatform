import { DashboardShell } from "@/components/layout/dashboard-shell"
import { db } from "@/lib/db"
import { requireCurrentAppUser } from "@/lib/auth/session"
import { Role } from "@/prisma/generated/client"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireCurrentAppUser()

  let providerTitle: string | null = null
  if (user.role === Role.PROVIDER || user.role === Role.NURSE) {
    const profile = await db.providerProfile.findUnique({
      where: { userId: user.id },
      select: { title: true },
    })
    providerTitle = profile?.title ?? null
  }

  return (
    <DashboardShell user={user} providerTitle={providerTitle}>
      {children}
    </DashboardShell>
  )
}
