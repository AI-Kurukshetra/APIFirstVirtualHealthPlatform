import { redirect } from "next/navigation"

import { getCurrentAppUser, getHomePathForUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const appUser = await getCurrentAppUser()

  redirect(appUser ? await getHomePathForUser(appUser) : "/login")
}
