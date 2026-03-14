import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function AdminUsersPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/admin/users")

  return (
    <PagePlaceholder
      description="Phase 2 will replace this page with paginated user lifecycle management and role-aware administration."
      eyebrow="Admin"
      title="User management"
    />
  )
}
