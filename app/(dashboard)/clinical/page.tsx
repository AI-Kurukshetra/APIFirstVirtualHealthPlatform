import { PagePlaceholder } from "@/components/layout/page-placeholder"
import { ensurePathAccess, requireCurrentAppUser } from "@/lib/auth/session"

export default async function ClinicalDashboardPage() {
  const user = await requireCurrentAppUser()
  ensurePathAccess(user, "/clinical")

  return (
    <PagePlaceholder
      description="Providers and nurses land here first. The clinical dashboard will grow into the EHR command center in Phase 3."
      eyebrow="Clinical"
      title="Clinical workspace"
    />
  )
}
