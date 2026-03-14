import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function AdminPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin")

  return (
    <PagePlaceholder
      description="Admin operators will manage users, audit visibility, and system-level workflows from this domain."
      eyebrow="Admin"
      title="Operational oversight"
    />
  )
}
