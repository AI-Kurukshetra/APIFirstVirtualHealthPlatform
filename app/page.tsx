import { redirect } from "next/navigation"

import { getCurrentAppUser, getDefaultDashboardPath } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const appUser = await getCurrentAppUser()

  redirect(appUser ? getDefaultDashboardPath(appUser.role) : "/login")
}
